#=
    Functionality for parsing, and handling SBML species (e.g conversion factor etc...)
=#

function parse_SBML_species!(model_SBML::ModelSBML, libsbml_model::SBML.Model)::Nothing
    for (specie_id, specie) in libsbml_model.species
        if specie_id ∈ ["true", "false", "time", "pi", "Inf", "NaN"]
            throw(SBMLSupport("Parameter name cannot be true, false, time, pi, Inf, NaN"))
        end

        # If both initial amount and conc are empty use concentration as unit per
        # SBML standard
        if isnothing(specie.initial_amount) && isnothing(specie.initial_concentration)
            initial_value = ""
            unit = specie.substance_units == "substance" ? :Amount : :Concentration
        elseif !isnothing(specie.initial_concentration)
            initial_value = string(specie.initial_concentration)
            unit = :Concentration
        else
            initial_value = string(specie.initial_amount)
            unit = :Amount
        end

        # Specie data
        only_substance_units = isnothing(specie.only_substance_units) ? false :
                               specie.only_substance_units
        boundary_condition = specie.boundary_condition
        compartment = specie.compartment
        conversion_factor = isnothing(specie.conversion_factor) ? "" :
                            specie.conversion_factor
        constant = isnothing(specie.constant) ? false : specie.constant

        # In case being a boundary condition the specie can only be changed events, or rate-rules so set
        # derivative to zero, likewise for constant the formula should be zero (no rate of change)
        if boundary_condition == true || constant == true
            formula = "0.0"
        else
            formula = ""
        end

        # In case the initial value is given in conc, but the specie should be given in amounts, adjust
        if unit == :Concentration && only_substance_units == true
            unit = :Amount
            initial_value *= " * " * compartment
        end

        model_SBML.species[specie_id] = SpecieSBML(specie_id, boundary_condition, constant,
                                                   initial_value,
                                                   formula, compartment, conversion_factor,
                                                   unit,
                                                   only_substance_units, false, false,
                                                   false)
    end
    return nothing
end

# Adjust specie equation if compartment is dynamic
function adjust_for_dynamic_compartment!(model_SBML::ModelSBML)::Nothing

    #=
    The volume might change over time but the amount should stay constant, as we have a boundary condition
    for a specie given by a rate-rule. In this case it follows that amount n (amount), V (compartment) and conc.
    are related via the chain rule by:
    dn/dt = d(n/V)/dt*V + n*dV/dt/V
    =#
    for (specie_id, specie) in model_SBML.species

        # Specie with amount where amount should stay constant
        compartment = model_SBML.compartments[model_SBML.species[specie_id].compartment]
        if !(specie.unit == :Amount &&
             specie.rate_rule == true &&
             specie.boundary_condition == true &&
             specie.only_substance_units == false &&
             compartment.rate_rule == true)
            continue
        end

        if compartment.constant == true
            continue
        end

        # In this case must add additional variable for the specie concentration, to properly get the amount equation
        specie_conc_id = "__" * specie_id * "__conc__"
        initial_value_conc = model_SBML.species[specie_id].initial_value * "/" *
                             compartment.name
        formula_conc = model_SBML.species[specie_id].formula * "/" * compartment.name

        # Formula for amount specie. Treated as rate-rule as this is a feature we do not support 
        # for mass-action models 
        model_SBML.species[specie_id].formula = formula_conc * "*" * compartment.name *
                                                " + " * specie_id * "*" *
                                                compartment.formula * " / " *
                                                compartment.name

        # Add new conc. specie to model. See comment on rate-rule above 
        model_SBML.species[specie_conc_id] = SpecieSBML(specie_conc_id, false, false,
                                                        initial_value_conc,
                                                        formula_conc, compartment.name,
                                                        specie.conversion_factor,
                                                        :Concentration, false, false, true,
                                                        false)
        push!(model_SBML.rate_rule_variables, specie_conc_id)
    end

    # When a specie is given in concentration, but the compartment concentration changes
    for (specie_id, specie) in model_SBML.species

        # To avoid that concentration species given as above are processed again
        if length(specie_id) ≥ 2 && specie_id[1:2] == "__"
            continue
        end

        compartment = model_SBML.compartments[model_SBML.species[specie_id].compartment]
        compartment_name = compartment.name
        if compartment.assignment_rule == true &&
           compartment.formula ∈ model_SBML.rate_rule_variables
            compartment = model_SBML.parameters[compartment.formula]
        end

        if !(specie.unit == :Concentration &&
             specie.only_substance_units == false &&
             compartment.constant == false)
            continue
        end
        # Rate rule has priority
        if specie_id ∈ model_SBML.rate_rule_variables
            continue
        end
        if !any(occursin.(keys(model_SBML.species), compartment.formula)) &&
           compartment.rate_rule == false
            continue
        end

        # Derivative and inital values newly introduced amount specie
        specie_amount_id = "__" * specie_id * "__amount__"
        initial_value_amount = specie.initial_value * "*" * compartment.name

        # If boundary condition is true only amount, not concentration should stay constant with 
        # compartment size
        if specie.boundary_condition == true
            formula_amount = "0.0"
        else
            formula_amount = isempty(specie.formula) ? "0.0" :
                             "(" * specie.formula * ")" * compartment_name
        end

        # New formula for conc. specie
        specie.formula = formula_amount * "/(" * compartment_name * ") - " *
                         specie_amount_id * "/(" * compartment_name * ")^2*" *
                         compartment.formula
        specie.rate_rule = true
        push!(model_SBML.rate_rule_variables, specie.name)

        # Add new conc. specie to model
        model_SBML.species[specie_amount_id] = SpecieSBML(specie_amount_id, false, false,
                                                          initial_value_amount,
                                                          formula_amount, compartment_name,
                                                          specie.conversion_factor,
                                                          :Amount, false, false, false,
                                                          false)
        for (r_id, r) in model_SBML.reactions
            for i in eachindex(r.products)
                if r.products[i] == specie.name
                    r.products[i] = specie_amount_id
                    r.products_stoichiometry[i] *= "*" * compartment_name
                end
            end
            for i in eachindex(r.reactants)
                if r.reactants[i] == specie.name
                    r.reactants[i] = specie_amount_id
                    r.reactants_stoichiometry[i] *= "*" * compartment_name
                end
            end
        end
    end
    return nothing
end

# Adjust specie via conversion factor 
function adjust_conversion_factor!(model_SBML::ModelSBML,
                                   libsbml_model::SBML.Model)::Nothing
    for (specie_id, specie) in model_SBML.species
        if specie.assignment_rule == true
            continue
        end

        if !haskey(libsbml_model.species, specie_id)
            continue
        end

        # Conversion factors only affect species whose values are changed via reactions, 
        # but not rate-rules
        if specie.rate_rule == true
            continue
        end

        # Boundary value species are not affected 
        if specie.boundary_condition == true
            continue
        end

        # Zero change of rate for specie
        if isempty(specie.formula)
            continue
        end

        if !isempty(specie.conversion_factor)
            conversion_factor = specie.conversion_factor
        elseif !isnothing(libsbml_model.conversion_factor)
            conversion_factor = libsbml_model.conversion_factor
        else
            return nothing
        end

        specie.formula = "(" * specie.formula * ") * " * conversion_factor
    end

    return nothing
end

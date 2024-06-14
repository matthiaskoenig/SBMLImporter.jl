function parse_SBML_events!(model_SBML::ModelSBML, libsbml_model::SBML.Model)::Nothing
    event_index = 1
    for (event_name, event) in libsbml_model.events

        # Parse the event trigger into proper Julia syntax
        math_expression = parse_math(event.trigger.math, libsbml_model)
        formula_trigger = math_expression.formula
        formula_trigger = insert_functions(formula_trigger, model_SBML.functions)
        if isempty(formula_trigger)
            continue
        end
        formula_trigger = parse_event_trigger(formula_trigger, model_SBML, libsbml_model)

        # Parse assignments and assignment formulas
        event_formulas::Vector{String} = Vector{String}(undef,
                                                        length(event.event_assignments))
        event_assignments::Vector{String} = similar(event_formulas)
        not_skip_assignments::Vector{Bool} = fill(true, length(event_formulas))
        for (i, event_assignment) in pairs(event.event_assignments)

            # Check if event should be ignored as no math child was provided
            math_expression = parse_math(event_assignment.math, libsbml_model)
            event_formula = math_expression.formula
            if isempty(event_formula)
                not_skip_assignments[i] = false
                continue
            end

            event_assignments[i] = event_assignment.variable

            # Parse the event formula into the correct Julia syntax
            event_formulas[i] = event_formula
            event_formulas[i] = replace_variable(event_formulas[i], "t", "integrator.t")
            event_formulas[i] = replace_reactionid_formula(event_formulas[i], libsbml_model)
            event_formulas[i] = process_SBML_str_formula(event_formulas[i], model_SBML,
                                                         libsbml_model;
                                                         check_scaling = false)

            # Formulas are given in concentration, but species can also be given in amounts. Thus, we must
            # adjust for compartment for the latter
            if haskey(model_SBML.species, event_assignments[i])
                if model_SBML.species[event_assignments[i]].unit == :Concentration
                    continue
                end
                # If the compartment is an assignment rule it will become simplifed away in later
                # stages, thus we need to unnest in this case
                compartment = model_SBML.compartments[model_SBML.species[event_assignments[i]].compartment]
                compartment_formula = compartment.assignment_rule == true ?
                                      compartment.formula : compartment.name
                event_formulas[i] = compartment_formula * " * (" * event_formulas[i] * ')'
                continue
            end
            if haskey(model_SBML.parameters, event_assignments[i])
                continue
            end
            if (haskey(model_SBML.compartments, event_assignments[i]) &&
                model_SBML.compartments[event_assignments[i]].constant == false)
                continue
            end

            model_SBML.species[event_assignments[i]] = SpecieSBML(event_assignments[i],
                                                                  false, false, "1.0",
                                                                  "",
                                                                  collect(keys(libsbml_model.compartments))[1],
                                                                  "", :Amount,
                                                                  false, false, false,
                                                                  false)
        end

        #=
            Handle special case where an event assignment acts on a compartment, here specie conc. in said
            compartment must be adjusted via;
            conc_new = conc_old * V_old / V_new
        =#
        adjust_event_compartment_change!!!(event_formulas, event_assignments,
                                           not_skip_assignments, model_SBML)

        # In case the compartment is given via an assignment rule to ensure nothing is simplified away and cannot
        # be retreived from the integrator interface in the callback replace the compartment with its corresponding formula
        for (compartment_id, compartment) in model_SBML.compartments
            if compartment.assignment_rule == false
                continue
            end
            formula_trigger = replace_variable(formula_trigger, compartment_id,
                                               compartment.formula)
            for i in eachindex(event_assignments)
                event_assignments[i] = replace_variable(event_assignments[i],
                                                        compartment_id, compartment.formula)
            end
        end

        event_name = isnothing(event_name) || isempty(event_name) ?
                     "event" * string(event_index) : event_name
        formulas = event_assignments[not_skip_assignments] .* " = " .*
                   event_formulas[not_skip_assignments]
        model_SBML.events[event_name] = EventSBML(event_name, formula_trigger, formulas,
                                                  event.trigger.initial_value)
        event_index += 1
    end

    return nothing
end

# Note, first three arguments can change
function adjust_event_compartment_change!!!(event_formulas::Vector{String},
                                            event_assignments::Vector{String},
                                            not_skip_assignments::Vector{Bool},
                                            model_SBML::ModelSBML)::Nothing
    event_assignments_cp = deepcopy(event_assignments)
    if isempty(model_SBML.compartments)
        return nothing
    end
    if !any(occursin.(event_assignments_cp[not_skip_assignments],
                      keys(model_SBML.compartments)))
        return nothing
    end

    for (i, assign_to) in pairs(event_assignments_cp[not_skip_assignments])

        # Only potentiallt adjust species if a compartment is assigned to in the
        # event
        if !haskey(model_SBML.compartments, assign_to)
            continue
        end

        # Check if a specie given in concentration is being assigned
        for (specie_id, specie) in model_SBML.species
            if specie.compartment != assign_to
                continue
            end
            if specie.unit == :Amount
                continue
            end

            # Adjust the conc. of specie
            if specie_id ∈ event_assignments
                is = findfirst(x -> x == specie_id, event_assignments)
                event_formulas[is] = "(" * event_formulas[is] * ")" * "*" * assign_to *
                                     "/" * "(" * event_formulas[i] * ")"
                continue
            end

            # Must add new event new to adjust conc. for species that is assigned to during event, but whose
            # conc. changes as its compart volume changes
            _formula = specie_id * "*" * assign_to * "/" * "(" * event_formulas[i] * ")"
            event_assignments = push!(event_assignments, specie_id)
            event_formulas = push!(event_formulas, _formula)
            not_skip_assignments = push!(not_skip_assignments, true)
        end
    end
    return nothing
end

# Rewrites triggers in events to the correct Julia syntax
function parse_event_trigger(formula_trigger::T, model_SBML::ModelSBML,
                             libsbml_model::SBML.Model)::T where {T <: AbstractString}

    # Stay consistent with t as time :)
    formula_trigger = replace_variable(formula_trigger, "time", "t")
    formula_trigger = process_SBML_str_formula(formula_trigger, model_SBML, libsbml_model)

    # SBML equations are given in conc, need to adapt scale state if said state is given in amounts,
    # rateOf expressions are handled later
    for (specie_id, specie) in model_SBML.species
        if specie.unit == :Concentration
            continue
        end
        if occursin("rateOf", formula_trigger)
            continue
        end
        if specie.only_substance_units == true
            continue
        end

        # If the compartment is an assignment rule it will become simplifed away in later
        # stages, thus we need to unnest in this case
        compartment = model_SBML.compartments[specie.compartment]
        compartment_formula = compartment.assignment_rule == true ? compartment.formula :
                              compartment.name
        formula_trigger = replace_variable(formula_trigger, specie_id,
                                           specie_id * '/' * compartment_formula)
    end

    # TODO: Need to refactor, ad hoc (triggered due to how functions rewrite, functions
    # should only at times rewrite this)
    if occursin(r">=", formula_trigger)
        formula_trigger = replace(formula_trigger, ">=" => "≥")
    end
    if occursin(r"<=", formula_trigger)
        formula_trigger = replace(formula_trigger, "<=" => "≤")
    end
    if occursin(r"<|≤|>|≥", formula_trigger)
        formula_trigger = replace(formula_trigger, "<" => "≤")
        formula_trigger = replace(formula_trigger, ">" => "≥")
        formula_trigger = replace_reactionid_formula(formula_trigger, libsbml_model)
        return formula_trigger
    end

    # Trigger can be a number, then event is triggered when formula is not equal to said number
    if typeof(formula_trigger) <: Real || is_number(formula_trigger)
        return string(formula_trigger) * " != 0"
    end

    if formula_trigger[1:2] == "if" || formula_trigger[1:3] ∈ ["and", "xor"]
        throw(SBMLSupport("Events with gated triggers (e.g and or) are not supported"))
    end

    # Done handling special trigger formats, this is the standard processing
    if "geq" == formula_trigger[1:3]
        _formula_trigger = formula_trigger[5:(end - 1)]
        separator = "≥"
    elseif "gt" == formula_trigger[1:2]
        _formula_trigger = formula_trigger[4:(end - 1)]
        separator = "≥"
    elseif "leq" == formula_trigger[1:3]
        _formula_trigger = formula_trigger[5:(end - 1)]
        separator = "≤"
    elseif "lt" == formula_trigger[1:2]
        _formula_trigger = formula_trigger[4:(end - 1)]
        separator = "≤"
    end
    parts = split_between(_formula_trigger, ',')

    # Account for potential reaction-math kinetics making out the trigger
    parts[1] = replace_reactionid_formula(parts[1], libsbml_model)
    parts[2] = replace_reactionid_formula(parts[2], libsbml_model)

    return "(" * parts[1] * ") " * separator * " (" * parts[2] * ")"
end

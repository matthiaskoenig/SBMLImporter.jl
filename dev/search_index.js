var documenterSearchIndex = {"docs":
[{"location":"Support/#support","page":"Supported SBML featuers","title":"Supported SBML Features","text":"","category":"section"},{"location":"Support/","page":"Supported SBML featuers","title":"Supported SBML featuers","text":"SBMLImporter supports many SBML features for models of level 2 or higher. Currently, excluding FBA models it successfully passes 1257 out of 1785 test cases. The failed test cases cover features currently not supported. Key features supported include:","category":"page"},{"location":"Support/","page":"Supported SBML featuers","title":"Supported SBML featuers","text":"Events.\nRate rules.\nAssignment rules.\nAlgebraic rules.\nDynamic compartment size.\nSpecies and model conversion factors.","category":"page"},{"location":"Support/","page":"Supported SBML featuers","title":"Supported SBML featuers","text":"Species can be specified in either concentrations or amounts. The unit is determined as follows:","category":"page"},{"location":"Support/","page":"Supported SBML featuers","title":"Supported SBML featuers","text":"If initialConcentration is set for a species, its unit will be set to concentration.\nIf initialAmount is set for a species, it will be treated as being in amount.\nIf neither is set, and the substanceUnits of the species is \"substance,\" it is treated as being in amounts.","category":"page"},{"location":"Support/","page":"Supported SBML featuers","title":"Supported SBML featuers","text":"Currently SBMLImporter does not support the following features:","category":"page"},{"location":"Support/","page":"Supported SBML featuers","title":"Supported SBML featuers","text":"Models with empty SBML reactions.\nDelay (creating a delay-differential-equations).\nEvents with delay.\nEvents with priority.\nHierarchical models.\nFast reactions.\nParameter or species names corresponding to Julia constants (pi, Inf, NaN, true, false).\nCertain uncommon math expressions, such as lt with three arguments, implies etc...","category":"page"},{"location":"Support/","page":"Supported SBML featuers","title":"Supported SBML featuers","text":"Import might also fail for complicated nested piecewise expressions inside SBML functions.","category":"page"},{"location":"Support/#Support-for-additional-features","page":"Supported SBML featuers","title":"Support for additional features","text":"","category":"section"},{"location":"Support/","page":"Supported SBML featuers","title":"Supported SBML featuers","text":"If SBMLImporter lacks support for a feature you would like to have, please file an issue on GitHub.","category":"page"},{"location":"#SBMLImporter.jl","page":"Home","title":"SBMLImporter.jl","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"SBMLImporter.jl is an importer for dynamic models defined in the Systems Biology Markup Language (SBML). It supports most SBML features, such as events, dynamic compartment sizes, and rate, assignment, and algebraic rules. For a complete list of supported features see here. A comparison of SBMLImporter.jl to SBMLToolkit.jl, listing the packages' differences, can be found towards the end of the README.","category":"page"},{"location":"","page":"Home","title":"Home","text":"To perform parameter estimation for a SBML model, see PEtab.jl.","category":"page"},{"location":"#Installation","page":"Home","title":"Installation","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"To install SBMLImporter.jl in the Julia REPL enter","category":"page"},{"location":"","page":"Home","title":"Home","text":"julia> ] add SBMLImporter","category":"page"},{"location":"","page":"Home","title":"Home","text":"or alternatively","category":"page"},{"location":"","page":"Home","title":"Home","text":"julia> using Pkg; Pkg.add(\"SBMLImporter\")","category":"page"},{"location":"","page":"Home","title":"Home","text":"SBMLImporter.jl is compatible with Julia version 1.6 and above. For best performance we strongly recommend using the latest Julia version.","category":"page"},{"location":"#Tutorial","page":"Home","title":"Tutorial","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"SBMLImporter import SBML models as a Catalyst ReactionSystem. This provides several benefits, such as symbolic model pre-processing for efficient simulations. The imported ReactionSystem can be converted to a JumpProblem for Gillespie simulations, a SDEProblem for Langevin SDE simulations, or an ODEProblem for deterministic ODE simulations","category":"page"},{"location":"","page":"Home","title":"Home","text":"As example, consider the Brusselator model (the SBML file can be downloaded from here). The first step is to import the model with load_SBML:","category":"page"},{"location":"","page":"Home","title":"Home","text":"using SBMLImporter\npath_SBML = joinpath(@__DIR__, \"..\", \"..\", \"test\", \"Models\", \"brusselator.xml\") # hide\nprnbng, cb = load_SBML(path_SBML)\nnothing # hide","category":"page"},{"location":"","page":"Home","title":"Home","text":"This returns two outputs: a ParsedReactionSystem (prnbng) and a CallbackSet (cb). The ParsedReactionSystem includes the reaction system (prnbng.rn), a map for the initial condition values of each specie (prnbng.u₀), and a map setting the model parameter values (prnbng.p). The CallbackSet holds any potential SBML events, along with SBML piecewise functions that have been parsed into events.","category":"page"},{"location":"#Jump-simulations","page":"Home","title":"Jump simulations","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"To perform jump simulations (e.g. using Gillespie's algorithm), convert the reaction system (prnbng.rn) into a JumpProblem (which requires first creating an intermediary DiscreteProblem).","category":"page"},{"location":"","page":"Home","title":"Home","text":"using JumpProcesses\nusing Random # hide\nRandom.seed!(1) # hide\ntspan = (0.0, 10.0)\ndprob = DiscreteProblem(prnbng.rn, prnbng.u₀, tspan, prnbng.p)\njprob = JumpProblem(prnbng.rn, dprob, Direct())\nnothing # hide","category":"page"},{"location":"","page":"Home","title":"Home","text":"The JumpProblem can be simulated with any solver from the JumpProcesses.jl package, such as the SSAStepper:","category":"page"},{"location":"","page":"Home","title":"Home","text":"using Plots\nsol = solve(jprob, SSAStepper(), callback=cb)\nplot(sol; lw=2)","category":"page"},{"location":"","page":"Home","title":"Home","text":"For more information on jump simulations, see JumpProcesses.jl's documentation.","category":"page"},{"location":"","page":"Home","title":"Home","text":"warn: Warn\nFor efficient jump simulations two conditions must be met: the model should be a mass-action model and each species should have units amount. This translates to ensuring that every species has the attribute hasOnlySubstanceUnits=true, and no rule variables are used in the kinetic math expressions for the SBML reactions.","category":"page"},{"location":"#SDE-simulations","page":"Home","title":"SDE simulations","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"To perform SDE simulations, convert the reaction-system prnbng.rn into a SDEProblem.","category":"page"},{"location":"","page":"Home","title":"Home","text":"using StochasticDiffEq\ntspan = (0.0, 10.0)\nsprob = SDEProblem(prnbng.rn, prnbng.u₀, tspan, prnbng.p)\nnothing # hide","category":"page"},{"location":"","page":"Home","title":"Home","text":"The SDEProblem can be simulated with any solver from the StochasticDiffEq.jl package, such as the LambaEM solver:","category":"page"},{"location":"","page":"Home","title":"Home","text":"sol = solve(sprob, LambaEM(), callback=cb)\nplot(sol; lw=2)","category":"page"},{"location":"","page":"Home","title":"Home","text":"For more information on SDE simulations, see StochasticDiffEq.jl's documentation.","category":"page"},{"location":"#ODE-simulations","page":"Home","title":"ODE simulations","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"To perform ODE simulations, convert the reaction system (prnbng.rn) into an ODEProblem.","category":"page"},{"location":"","page":"Home","title":"Home","text":"using ModelingToolkit, OrdinaryDiffEq\ntspan = (0.0, 10.0)\nsys = convert(ODESystem, prnbng.rn)\noprob = ODEProblem(sys, prnbng.u₀, tspan, prnbng.p, jac=true)\nnothing # hide","category":"page"},{"location":"","page":"Home","title":"Home","text":"Here jac=true means that the ODE Jacobian is computed symbolically which can help with simulation performance. The ODEProblem can be simulated with any solver from the OrdinaryDiffEq.jl package, such as the Rodas5 solver:","category":"page"},{"location":"","page":"Home","title":"Home","text":"sol = solve(oprob, Rodas5(), callback=cb)\nplot(sol; lw=2)","category":"page"},{"location":"","page":"Home","title":"Home","text":"For more information on ODE simulations, see OrdinaryDiffEq.jl's documentation.","category":"page"},{"location":"#Citation","page":"Home","title":"Citation","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"We will soon publish a paper you can cite if you found SBMLImporter.jl helpful in your work.","category":"page"},{"location":"API_choosen/#API","page":"API","title":"API","text":"","category":"section"},{"location":"API_choosen/","page":"API","title":"API","text":"load_SBML","category":"page"},{"location":"API_choosen/#SBMLImporter.load_SBML","page":"API","title":"SBMLImporter.load_SBML","text":"load_SBML(path_SBML::AbstractString;\n          ifelse_to_callback::Bool=true,\n          inline_assignment_rules::Bool=false,\n          write_to_file::Bool=false,\n          model_as_string::Bool=false)\n\nParse an SBML model into a ParsedReactionNetwork and convert SBML events/piecewise to callbacks.\n\nFor information on simulating the ParsedReactionNetwork, as a JumpProblem, a SDEProblem, or an ODEProblem see the documentation.\n\npath_SBML can be the model as a string if model_as_string=true.\n\nArguments\n\npath_SBML: File path to a valid SBML file (level 2 or higher).\nifelse_to_callback=true: Whether to rewrite ifelse (piecewise) expressions to callbacks; recommended   for performance.\ninline_assignment_rules=true: Whether to inline assignment rules into model equations. Recommended for   model import speed, however, it will not be possible to access the rule-variable via sol[:var].\nwrite_to_file=false: Whether to write the parsed SBML model to a Julia file in the same directory as the   SBML file.\nmodel_as_string=false: Whether or not the model (path_SBML) is provided as a string.\n\nReturns\n\nparsed_rn: A ParsedReactionNetwork struct that can be converted into a JumpProblem, a SDEProblem, or   an ODEProblem\ncbset: Callbackset (events, piecewise etc...) for the model.\n\nExamples\n\n# Import and simulate model as a JumpProblem\nusing SBMLImporter, JumpProcesses\nprnbng, cb = load_SBML(path_SBML)\ntspan = (0.0, 10.0)\ndprob = DiscreteProblem(prnbng.rn, prnbng.u₀, tspan, prnbng.p)\njprob = JumpProblem(prnbng.rn, dprob, Direct())\nsol = solve(jprob, SSAStepper(), callback=cb)\n\n# Import and simulate model as a SDE\nusing SBMLImporter, StochasticDiffEq\nprnbng, cb = load_SBML(path_SBML)\ntspan = (0.0, 10.0)\nsprob = SDEProblem(prnbng.rn, prnbng.u₀, tspan, prnbng.p)\nsol = solve(sprob, LambaEM(), callback=cb)\n\n# Import and simulate model as an ODE\nusing SBMLImporter, ModelingToolkit, OrdinaryDiffEq\nprnbng, cb = load_SBML(path_SBML)\nsys = convert(ODESystem, prnbng.rn)\noprob = ODEProblem(sys, prnbng.u₀, tspan, prnbng.p, jac=true)\nsol = solve(oprob, Rodas5P(), callback=cb)\n\n\n\n\n\n","category":"function"}]
}

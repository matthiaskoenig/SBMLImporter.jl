var documenterSearchIndex = {"docs":
[{"location":"differences.html#Other-SBML-related-Julia-packages","page":"Other SBML related Julia packages","title":"Other SBML related Julia packages","text":"","category":"section"},{"location":"differences.html","page":"Other SBML related Julia packages","title":"Other SBML related Julia packages","text":"There are currently three additional SBML related packages in Julia. SBML.jl wraps a subset of the libSBML functionality and is used by SBMLImporter and other SBML related packages for parsing SBML models. COBREXA.jl is designed for constraint-based metabolic modeling. Constraint-based models, which are often referred to as flux-balance analysis (FBA) models, are not supported by SBMLImporter., thus for FBA models we recommend COBREXA.","category":"page"},{"location":"differences.html","page":"Other SBML related Julia packages","title":"Other SBML related Julia packages","text":"Lastly, SBMLToolkit.jl similarly to SBMLImporter imports dynamic models into a ReactionSystem. However, we recommend SBMLImporter due to the following key differences:","category":"page"},{"location":"differences.html","page":"Other SBML related Julia packages","title":"Other SBML related Julia packages","text":"SBMLToolkit works with (and transforms) species to be in amount. SBMLImporter supports species units to be either amount or concentration.\nSBMLImporter has wider event support, including events with directionality. It further processes events without species in the trigger into a DiscreteCallback, making simulations more efficient.\nSBMLImporter rewrites SBML piecewise expressions to callbacks if possible instead of using ifelse, this improves simulation stability and reduces simulation runtime.\nWhen possible, SBMLImporter converts reactions to so-called MassActionJumps. This greatly improve performance for most Jump simulations.\nSBMLImporter has more extensive SBML support, passing more tests in the SBML test-suite. It is further the SBML importer for PEtab.jl, which regularly tests against several published models of various sizes.","category":"page"},{"location":"support.html#support","page":"Supported SBML featuers","title":"Supported SBML Features","text":"","category":"section"},{"location":"support.html","page":"Supported SBML featuers","title":"Supported SBML featuers","text":"SBMLImporter supports many SBML features for models of level 2 or higher. Currently, excluding FBA models it successfully passes around 1300 out of 1785 test cases. The failed test cases cover features currently not supported. Key features supported include:","category":"page"},{"location":"support.html","page":"Supported SBML featuers","title":"Supported SBML featuers","text":"Events.\nRate rules.\nAssignment rules.\nAlgebraic rules.\nDynamic compartment size.\nSpecies and model conversion factors.","category":"page"},{"location":"support.html","page":"Supported SBML featuers","title":"Supported SBML featuers","text":"Species can be specified in either concentrations or amounts. The unit is determined as follows:","category":"page"},{"location":"support.html","page":"Supported SBML featuers","title":"Supported SBML featuers","text":"If initialConcentration is set for a species, its unit will be set to concentration.\nIf initialAmount is set for a species, it will be treated as being in amount.\nIf neither is set, and the substanceUnits of the species is \"substance,\" it is treated as being in amounts.","category":"page"},{"location":"support.html","page":"Supported SBML featuers","title":"Supported SBML featuers","text":"Currently SBMLImporter does not support the following features:","category":"page"},{"location":"support.html","page":"Supported SBML featuers","title":"Supported SBML featuers","text":"Delay (creating a delay-differential-equations).\nEvents with delay.\nEvents with priority.\nHierarchical models.\nFast reactions.\nParameter or species names corresponding to Julia constants (pi, Inf, NaN, true, false).\nCertain uncommon math expressions, such as lt with three arguments, implies etc...","category":"page"},{"location":"support.html#Support-for-additional-features","page":"Supported SBML featuers","title":"Support for additional features","text":"","category":"section"},{"location":"support.html","page":"Supported SBML featuers","title":"Supported SBML featuers","text":"If SBMLImporter lacks support for a feature you would like to have, please file an issue on GitHub.","category":"page"},{"location":"FAQ.html#FAQ","page":"FAQs","title":"FAQs","text":"","category":"section"},{"location":"FAQ.html#Why-do-I-get-the-error-Any[...]-are-either-missing-from-the-variable-map-or-missing-from-the-system's-states/parameters-list?","page":"FAQs","title":"Why do I get the error Any[...] are either missing from the variable map or missing from the system's states/parameters list?","text":"","category":"section"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"This error probably occurs because the model has an SBML assignment rule. Assignment rules describe the assignment of an equation to a variable:","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"var = assignment # var ~ assignment in ModelingToolkit syntax","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"To be able to simulate the model assignment rules must be inlined into the model equations. This can be done with the structural_simplify function from ModelingToolkit. For example, for an ODE model do:","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"using SBMLImporter, ModelingToolkit\nprn, cb = load_SBML(path)\nsys = structural_simplify(convert(ODESystem, prn.rn))\noprob = ODEProblem(sys, prn.u0, tspan, prn.p)","category":"page"},{"location":"FAQ.html#How-can-I-check-if-my-model-follows-mass-action-kinetics?","page":"FAQs","title":"How can I check if my model follows mass action kinetics?","text":"","category":"section"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"For efficient jump simulations (Gillespie type), the model should ideally follow chemical mass action kinetics. To inform the importer about mass action kinetics simply set the keyword argument massaction=true in load_SBML. Now, if you are unsure whether the model follows mass action kinetics, simply provide massaction=true. If the model does not adhere to mass action kinetics, a warning is thrown:","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"Warning: That the system is massaction was provided, however, the reaction r is not massaction. It is parsed as non massaction reaction, which can negatively impact simulation times","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"note: Note\nThe massaction keyword argument is only relevant for jump simulations. If you import the model as a SDEProblem or an ODEProblem, you can (and should) ignore this keyword argument.","category":"page"},{"location":"FAQ.html#Why-does-one-of-the-SBML-model-parameters-not-appear-among-the-system-parameters?","page":"FAQs","title":"Why does one of the SBML model parameters not appear among the system parameters?","text":"","category":"section"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"If one of the model parameters does not appear among the system parameters:","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"prn, cb = load_SBML(path)\nparameters(prn)","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"but appears in the model variables:","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"unknowns(prn)","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"this is likely because the parameter is not set as constant in the SBML file, e.g.:","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"<parameter id=\"c\" value=\"1.0\" constant=\"false\"/>","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"If a parameter is set to have constant=\"false\", the importer must treat the parameter as a variable since it can change over time (explicitly depend on time), as Julia ReactionSystem parameters are assumed to time invariant. If the parameter should indeed be constant (e.g. at most be changed by an event), change the parameter in the model file:","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"<parameter id=\"c\" value=\"1.0\" constant=\"true\"/>","category":"page"},{"location":"FAQ.html#How-do-I-access-SBML-reaction-ID-and-reaction-name?","page":"FAQs","title":"How do I access SBML reaction ID and reaction name?","text":"","category":"section"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"SBML reactions have both an ID and a name that can differ. When importing an SBML model, SBMLImporter stores these as metadata in every Catalyst.Reaction. This metadata can be accessed with the Catalyst getmetadata function. For example, to retrieve both the ID and name for the first reaction in a model, do:","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"prn, cb = load_SBML(path_SBML)\nsbml_reactions = reactions(prn.rn)\ngetmetadata(sbml_reactions[1], :id)\ngetmetadata(sbml_reactions[1], :name)","category":"page"},{"location":"FAQ.html#Why-does-my-simulation-fail-with-DomainError-while-the-model-imports-fine?","page":"FAQs","title":"Why does my simulation fail with DomainError while the model imports fine?","text":"","category":"section"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"This typically happens due to two reasons. Firstly, the model might contain a function call where the argument must be positive, such as:","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"log(specie)","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"Even though the model might be written such that specie should never go below 0 (e.g., the model follows mass action kinetics), numerical errors can cause specie to go below zero. Therefore, instead of encoding risky statements into the model such as log(specie), it might be better to encode something like log(specie + 1e-8).","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"Secondly DomainError might arise due to how SBMLImporter parses SBML piecewise expressions. Piecewise expressions are first parsed into ifelse functions:","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"ifelse(condition, x, y)","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"Which when condition == true evaluates to x, otherwise to y. In SBMLImporter ifelse expressions are further rewritten to callbacks (events). Hence, in the model equations the ifelse is converted to:","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"(1 - condition_bool) * x + condition_bool * y","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"Here condition_bool is assigned via a callback (event) to be 1 when condition is true, and to 0 when condition if false. This has the same functionality as an ifelse, but is numerically more stable because the integrator (e.g., ODE solver) actually stops at points condition changes. Instead, with ifelse, the integrator does not know an event happens and thus must typically reduce its step size to handle the sudden change in models dynamics. This increases simulation time, and reduces simulation stability (e.g. ODE solvers fail more frequently). However, sometimes the formulas in the ifelse might depend on the condition. For example, let's say we have:","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"ifelse(t > 1, 0, log(t - 1))","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"With the ifelse formulation, log(t - 1) is never evaluated until t > 1. With the callback formulation:","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"(1 - condition_bool) * 0 + condition_bool * log(t-1)","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"log(t-1) is evaluated for time-points t < 1 which causes DomainError. This can be solved by simply not rewriting ifelse to callback when importing the model:","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"prn, cb = load_SBML(path; ifelse_to_callback = false)","category":"page"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"If neither of the above solutions work, please file an issue on GitHub.","category":"page"},{"location":"FAQ.html#Why-did-I-get-the-SBMLSupport-error?","page":"FAQs","title":"Why did I get the SBMLSupport error?","text":"","category":"section"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"You likely got this error because your SBML model contains an SBML feature that SBMLImporter does not support yet. An extensive list of supported features can be found here. If SBMLImporter lacks support for a feature you would like to have, please file an issue on GitHub.","category":"page"},{"location":"FAQ.html#Do-you-support-SBML-export?","page":"FAQs","title":"Do you support SBML export?","text":"","category":"section"},{"location":"FAQ.html","page":"FAQs","title":"FAQs","text":"We currently do not support exporting Catalyst ReactionSystem to SBML. Most things are available in Julia for supporting SBML export though, so if anyone is interested, we would be happy to provide guidance for creating a SBMLExporter package.","category":"page"},{"location":"index.html#SBMLImporter.jl","page":"Home","title":"SBMLImporter.jl","text":"","category":"section"},{"location":"index.html","page":"Home","title":"Home","text":"SBMLImporter is a Julia package for importing dynamic Systems Biology Markup Language (SBML) models into either a JumpProblem for Gillespie simulations, a SDEProblem for chemical Langevin simulations, or an ODEProblem for deterministic simulations.","category":"page"},{"location":"index.html#Major-highlights","page":"Home","title":"Major highlights","text":"","category":"section"},{"location":"index.html","page":"Home","title":"Home","text":"Imports an SBML models into a Catalyst.jl ReactionSystem. This allows for easy conversion to a JumpProblem, a SDEProblem, or an ODEProblem.\nSupport for a majority of SBML features, such as dynamic compartments, events, rules, piecewise (ifelse) expressions, and units. An extensive feature list can be found here.\nThoroughly tested against both the SBML test suite and a large collection of published models.\nIntegrates with PEtab.jl for fitting SBML models to data.","category":"page"},{"location":"index.html","page":"Home","title":"Home","text":"note: Star us on GitHub!\nIf you find the package useful in your work please consider giving us a star on GitHub. This will help us secure funding in the future to continue maintaining the package.","category":"page"},{"location":"index.html#Installation","page":"Home","title":"Installation","text":"","category":"section"},{"location":"index.html","page":"Home","title":"Home","text":"To install SBMLImporter.jl in the Julia REPL enter","category":"page"},{"location":"index.html","page":"Home","title":"Home","text":"julia> ] add SBMLImporter","category":"page"},{"location":"index.html","page":"Home","title":"Home","text":"or alternatively","category":"page"},{"location":"index.html","page":"Home","title":"Home","text":"julia> using Pkg; Pkg.add(\"SBMLImporter\")","category":"page"},{"location":"index.html","page":"Home","title":"Home","text":"SBMLImporter is compatible with Julia version 1.10 and above. For best performance we strongly recommend using the latest Julia version.","category":"page"},{"location":"index.html#Getting-help","page":"Home","title":"Getting help","text":"","category":"section"},{"location":"index.html","page":"Home","title":"Home","text":"If you have any problems using SBMLImporter, here are some helpful tips:","category":"page"},{"location":"index.html","page":"Home","title":"Home","text":"Read the FAQ section in the online documentation.\nPost your questions in the #sciml-sysbio channel on the Julia Slack.\nIf you believe you have encountered unexpected behavior or a bug, please open an issue on GitHub.","category":"page"},{"location":"tutorial.html#Tutorial","page":"Tutorial","title":"Tutorial","text":"","category":"section"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"This overarching tutorial of SBMLImporter will cover how to import an SBML model into a JumpProblem for Gillespie simulations, a SDEProblem for chemical Langevin simulations, or an ODEProblem for deterministic simulations.","category":"page"},{"location":"tutorial.html#Input-a-valid-SBML-model-file","page":"Tutorial","title":"Input - a valid SBML model file","text":"","category":"section"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"SBMLImporter only requires one input: a valid SBML file. SBML files can be created from various sources, such as the graphical interface of COPASI, by converting rule-based BioNetGen models, or by using any other SBML exporting tools. Additionally, a large collection of published SBML models are hosted on BioModels.","category":"page"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"In this tutorial, we will use the Brusselator model, whose SBML file can be downloaded from here.","category":"page"},{"location":"tutorial.html#Importing-a-model","page":"Tutorial","title":"Importing a model","text":"","category":"section"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"To import an SBML model use load_SBML:","category":"page"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"using SBMLImporter\npath = joinpath(@__DIR__, \"..\", \"..\", \"test\", \"Models\", \"brusselator.xml\") # hide\nprn, cb = load_SBML(path; massaction=true)\nnothing # hide","category":"page"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"Here, massaction=true informs the importer that the model follows chemical mass action kinetics. This is required for efficient jump (Gillespie type) simulations.","category":"page"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"load_SBML returns two outputs: a ParsedReactionSystem (prn) and a CallbackSet (cb). The ParsedReactionSystem includes a Catalyst ReactionSystem (prn.rn), a map for the initial condition values of each species (prn.u0), and a map for setting the model parameter values (prn.p). The CallbackSet holds any potential SBML events, along with SBML piecewise functions that have been parsed into events.","category":"page"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"note: Note\nThe massaction keyword argument is only relevant for jump simulations. If you import the model as a SDEProblem or an ODEProblem, you can (and should) ignore this keyword argument.","category":"page"},{"location":"tutorial.html#Jump-simulations","page":"Tutorial","title":"Jump simulations","text":"","category":"section"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"To perform jump simulations (e.g. using Gillespie's algorithm), convert the reaction system (prn.rn) into a JumpProblem (which requires first creating an intermediary DiscreteProblem).","category":"page"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"using JumpProcesses\nusing Random # hide\nRandom.seed!(1) # hide\ntspan = (0.0, 10.0)\ndprob = DiscreteProblem(prn.rn, prn.u0, tspan, prn.p)\njprob = JumpProblem(prn.rn, dprob, Direct())\nnothing # hide","category":"page"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"The JumpProblem can be simulated with any solver from the JumpProcesses.jl package, such as the SSAStepper:","category":"page"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"using Plots\nsol = solve(jprob, SSAStepper(), callback=cb)\ndefault(left_margin=12.5Plots.Measures.mm, bottom_margin=12.5Plots.Measures.mm) # hide\nplot_args = (titlefontsize=12, guidefontsize=12, tickfontsize=12, legendfontsize=12, size=(600*1.2, 400*1.2), lw = 3, xlabel = \"Time [s]\", ylabel = \"Protein amount\") # hide\nplot(sol; lw = 3, xlabel = \"Time [s]\", ylabel = \"Protein amount\")\nplot(sol; plot_args...) # hide","category":"page"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"For more information on jump simulations, see JumpProcesses.jl's documentation.","category":"page"},{"location":"tutorial.html#SDE-simulations","page":"Tutorial","title":"SDE simulations","text":"","category":"section"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"To perform chemical Langevin SDE simulations, convert the reaction-system prn.rn into a SDEProblem.","category":"page"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"using StochasticDiffEq\ntspan = (0.0, 10.0)\nsprob = SDEProblem(prn.rn, prn.u0, tspan, prn.p)\nnothing # hide","category":"page"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"The SDEProblem can be simulated with any solver from the StochasticDiffEq.jl package, such as the LambaEM solver:","category":"page"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"sol = solve(sprob, LambaEM(), callback=cb)\nplot(sol; lw = 3, xlabel = \"Time [s]\", ylabel = \"Protein amount\")\nplot(sol; plot_args...) # hide","category":"page"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"For more information on SDE simulations, see StochasticDiffEq.jl's documentation.","category":"page"},{"location":"tutorial.html#ODE-simulations","page":"Tutorial","title":"ODE simulations","text":"","category":"section"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"To perform ODE simulations, convert the reaction system (prn.rn) into an ODEProblem.","category":"page"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"using ModelingToolkit, OrdinaryDiffEq\ntspan = (0.0, 10.0)\nsys = structural_simplify(convert(ODESystem, prn.rn))\noprob = ODEProblem(sys, prn.u0, tspan, prn.p, jac=true)\nnothing # hide","category":"page"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"Here we call structural_simplify to inline any potential assignment rules into the model equations. Additionally, setting jac=true means that the ODE Jacobian is computed symbolically, which often improves simulation performance. The ODEProblem can be simulated with any solver from the OrdinaryDiffEq.jl package, such as the Rodas5P solver:","category":"page"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"sol = solve(oprob, Rodas5P(), callback=cb)\nplot(sol; lw = 3, xlabel = \"Time [s]\", ylabel = \"Protein amount\")\nplot(sol; plot_args...) # hide","category":"page"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"For more information on ODE simulations, see OrdinaryDiffEq.jl's documentation.","category":"page"},{"location":"tutorial.html#Next-Steps","page":"Tutorial","title":"Next Steps","text":"","category":"section"},{"location":"tutorial.html","page":"Tutorial","title":"Tutorial","text":"For additional modeling tasks that can be carried out with a Catalyst ReactionSystem (e.g., bifurcation analysis, parameter estimation, etc.), see the Catalyst documentation. If you encounter any problems with importing an SBML model, first consult the FAQ. Additional details on importer options can be found in the API.","category":"page"},{"location":"API.html#API","page":"API","title":"API","text":"","category":"section"},{"location":"API.html","page":"API","title":"API","text":"load_SBML","category":"page"},{"location":"API.html#SBMLImporter.load_SBML","page":"API","title":"SBMLImporter.load_SBML","text":"load_SBML(path; massaction=false, kwargs...)\n\nImport an SBML model into a ParsedReactionNetwork that can be simulated as a JumpProblem for Gillespie simulations, a SDEProblem for chemical Langevin simulations, or an ODEProblem for deterministic simulations.\n\nThe keyword massaction should be set to true if the model reactions follow chemical mass action kinetics. This is because the most efficient JumpProblem (Gillespie) simulators require mass action jumps, for more details see here. For how to check if a model follows mass action kinetics, see the FAQ in the documentation.\n\nnote: Note\nThe massaction keyword argument is only relevant for jump simulations. If you import the model as a SDEProblem or an ODEProblem, you can (and should) ignore this keyword argument.\n\nKeyword arguments\n\ncomplete::Bool=true: Whether or not to mark the returned Catalyst ReactionSystem as   complete. Only a complete system can be used for simulations, while only an incomplete   system can be composed with other systems. For more details, see the Catalyst.jl   documentation.\nifelse_to_callback::Bool=true: Rewrite ifelse (SBML piecewise) expressions to callbacks. This improves simulation runtime and stability. Strongly recomended to set to true.\ninline_assignment_rules::Bool=false: Inline SBML assignment rules into model equations.   Recommended for importing large models. However, if set to true, it is   not possible to access assignment rule variables via sol[:var].\nwrite_to_file::Bool=false: Write the parsed SBML model to a Julia file in the same   directory as the SBML file.\nmodel_as_string::Bool=false: Whether the model (path) is provided as a string.\n\nReturns\n\nprn: A ParsedReactionNetwork that can be converted into a JumpProblem, a   SDEProblem, or an ODEProblem. Important fields are:\nprn.rn: A Catalyst.jl ReactionNetwork.\nprn.u0: A value map for setting initial values for model species.\nprn.p: A value map for setting model parameter values.\ncbset: A CallbackSet with SBML events and SBML piecewise functions.\n\nExamples\n\n# Import and simulate model as a JumpProblem\nusing SBMLImporter, JumpProcesses\nprn, cb = load_SBML(path; massaction=true)\ntspan = (0.0, 10.0)\ndprob = DiscreteProblem(prn.rn, prn.u0, tspan, prn.p)\njprob = JumpProblem(prn.rn, dprob, Direct())\nsol = solve(jprob, SSAStepper(), callback=cb)\n\n# Import and simulate model as a SDE\nusing SBMLImporter, StochasticDiffEq\nprn, cb = load_SBML(path)\ntspan = (0.0, 10.0)\nsprob = SDEProblem(prn.rn, prn.u0, tspan, prn.p)\nsol = solve(sprob, LambaEM(), callback=cb)\n\n# Import and simulate model as an ODE\nusing SBMLImporter, OrdinaryDiffEq\nprn, cb = load_SBML(path)\noprob = ODEProblem(prn.rn, prn.u0, tspan, prn.p)\nsol = solve(oprob, Rodas5P(), callback=cb)\n\n\n\n\n\n","category":"function"}]
}

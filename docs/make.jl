using SBMLImporter
using Documenter

DocMeta.setdocmeta!(SBMLImporter, :DocTestSetup, :(using SBMLImporter); recursive=true)

makedocs(;
    modules=[SBMLImporter],
    repo="https://github.com/sebapersson/SBMLImporter.jl/blob/{commit}{path}#{line}",
    checkdocs=:exports,
    warnonly=false,
    sitename="SBMLImporter.jl",
    format=Documenter.HTML(;
        prettyurls=get(ENV, "CI", "false") == "true",
        canonical="https://sebapersson.github.io/SBMLImporter.jl",
        edit_link="main",
        assets=String[],
    ),
    pages=[
        "Home" => "index.md",
        "API" => "API_choosen.md"
    ],
)

deploydocs(;
    repo="github.com/sebapersson/PEtab.jl.git",
    devbranch="main",
)

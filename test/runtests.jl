using SafeTestsets

@safetestset "Aqua Quality Check" begin
    include("Aqua.jl")
end

@safetestset "SBML large model" begin
    include("Large_model.jl")
end

@safetestset "Write model" begin
    include("Write_model.jl")
end

@safetestset "SBML semantic test-suite" begin
    include("Semantic_tests.jl")
end

@safetestset "SBML stochastic test-suite" begin
    include("Stochastic_tests.jl")
end

@safetestset "Currated jump simulation test" begin
    include("curated_jump_test.jl")
end

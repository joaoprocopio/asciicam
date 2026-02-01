1. mover o trabalho da cpu com o `2DRenderingContext` para a `webgl2`, já vai mover o trabalho da CPU para a GPU.
2. experimentar o uso da API moderna de WebGPU, ver se aumenta a performance mais ainda, o paradigma é completamente diferente do `webgl2`.
3. talvez mover o trabalho da main-thread para um worker com o `OffscreenCanvas`, mais isso pode trazer um custo de comunicação entre threads, deixando mais lento, talvez.

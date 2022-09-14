import * as ts from 'typescript'
import { readdirSync, readFileSync } from 'fs'
import { join as joinPath } from 'path'

const directoryLoader = (path: any) => {
  try {
    const fileNames = readdirSync(path)

    return fileNames.flatMap((file: any) => {
      const code = readFileSync(joinPath(path, file), 'utf8')
      const transpileModule = ts.transpileModule(code, {
        compilerOptions : {
          module : ts.ModuleKind.CommonJS,
        },
      })
      const module = {} // Scope shielding against the eval of module.export assignment
      const exportedObjects = eval(transpileModule.outputText)
      // Each require may return either one record or array of records
      // const exportedObjects = (await import(joinPath(path, file))).default[0]
      const numObjects = Array.isArray(exportedObjects) ? exportedObjects.length : 1
      console.log(`Importing ${numObjects} record(s) from ${file}`)
      return exportedObjects
    })
  } catch (error: unknown) {
    if (typeof error === 'string')
      console.log(`### Error: ${error}`)
    else
      console.log(JSON.stringify(error))
    return []
  }
}

module.exports = directoryLoader

export default directoryLoader
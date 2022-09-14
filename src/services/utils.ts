export function cloneObjectPropValues(obj: any): any {
  return Object.entries(Object.getOwnPropertyDescriptors(obj))
    .filter(([_, descriptor]) => descriptor.value || typeof descriptor.get === 'function')
    .map(([key, _]) => {
      return { [key] : obj[key] }
    })
    .reduce((a, b) => Object.assign(a, b), {})
}

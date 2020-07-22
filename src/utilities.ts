export function stringToSnakeCase(value:string) {
    return value.trim().replace(new RegExp(/\s+/g), '_').toLowerCase()
}
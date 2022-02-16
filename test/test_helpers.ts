export const buildConsoleString = function (stub: any): string {
  const logs: string[] = []
  for (let i = 0; i < stub.callCount; ++i) {
    logs.push(stub.getCall(i).args.join(' '))
  }

  return logs.join('\n')
}

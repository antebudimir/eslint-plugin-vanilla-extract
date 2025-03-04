declare module 'eslint-plugin-eslint-plugin' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const configs: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rules: Record<string, any>;
  export { configs, rules };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _default: { configs: Record<string, any>; rules: Record<string, any> };
  export default _default;
}

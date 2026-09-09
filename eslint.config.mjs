import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTS from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const [nextBase, ...nextRest] = coreWebVitals;

// ponytail: eslint-plugin-react@7.37.5 crashes under ESLint 10
// (contextOrFilename.getFilename is not a function); drop its 22 rules,
// keep react-hooks/import/jsx-a11y/@next. Re-enable when plugin supports v10.
const { rules = {}, ...baseRest } = nextBase;
const rulesWithoutReact = Object.fromEntries(
  Object.entries(rules).filter(([name]) => !name.startsWith("react/")),
);

const config = [
  { ...baseRest, rules: rulesWithoutReact },
  ...nextRest,
  ...nextTS,
  prettier,
];

export default config;

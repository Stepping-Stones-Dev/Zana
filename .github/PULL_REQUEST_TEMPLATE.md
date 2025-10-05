## Summary
Provide a concise description of the change and its primary objective.
### Issue Reference
Link related issue(s): #ISSUE_NUMBER or N/A

### Change Description
Briefly list key code / logic changes:
- 
- 

### Testing Summary
- [ ] Test coverage updated/sufficient
- [ ] Manual testing performed

### Manual Test Notes
Steps / scenarios exercised:
1. 
2. 
3. 

### Additional Verification (optional)
Notes on edge cases, performance, or regression risk:
- 
## Security Impact
- [ ] No security-relevant changes
- [ ] Introduces new data flow
- [ ] Modifies authentication or authorization logic
- [ ] Touches cryptography / key handling
- [ ] Affects input validation / deserialization
- [ ] Changes logging / telemetry of sensitive data

If any box (other than first) is checked, briefly explain risk & mitigation:

> Impact Analysis:

## Data Classification / Privacy
- New or changed data stored? (Y/N & describe)
- Sensitive categories (PII, credentials, tokens, health, financial)?
- Data residency / retention changes?

## Testing & Verification
- [ ] Added/updated unit tests
- [ ] Added/updated integration/e2e tests
- [ ] Manually tested in local dev
- [ ] Security scan (`pnpm security:scan`) passes

## Checklist
- [ ] Lint passes (`pnpm lint`)
- [ ] Type check (if not part of build) passes
- [ ] No secrets or sample credentials committed
- [ ] Documentation / ADR updated (if applicable)

## Additional Notes
(Optional)

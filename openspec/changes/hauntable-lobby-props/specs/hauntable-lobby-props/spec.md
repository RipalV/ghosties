## ADDED Requirements

### Requirement: Typed hauntable lobby props
The game SHALL define exactly three hauntable lobby props as typed content outside `GameScene`: a reception bell compatible with Object Nudge, a crooked portrait compatible with Whisper, and a drafty fireplace or curtains prop compatible with Cold Puff. Each prop definition SHALL include a stable id, accessible display name, fixed world position, compatible scare category, ghost activation radius, visitor reaction radius, visual reaction configuration, family-friendly visitor reaction text (or per-visitor reaction copy), and per-visit combo availability tracking via session state. Prop positions and radii SHALL use fixed world coordinates so behaviour is identical across devices and zoom levels.

#### Scenario: Three props with distinct scare categories
- **WHEN** hauntable lobby props are loaded
- **THEN** exactly three props exist
- **AND** their compatible scare categories are object, whisper, and cold (one each)
- **AND** definitions are not hard-coded inside `GameScene`

#### Scenario: Prop fields are complete
- **GIVEN** any hauntable prop definition
- **WHEN** content is validated
- **THEN** it has id, display name, position, compatible category, ghost activation radius, visitor reaction radius, and reaction presentation data

### Requirement: Compatible cast links a prop
When the player starts an affordable scare cast while a visitor is targetable and the ghost is within a prop’s ghost activation radius for a scare whose category matches that prop, the game SHALL link that prop to the cast and show clear casting feedback on the prop. If multiple compatible props are in range, the nearest by world distance SHALL be linked. Existing scare-cast progress, exposure tracking, and visitor route progression SHALL continue unchanged. Leaving the prop’s activation radius mid-cast SHALL NOT cancel the cast or clear cast progress.

#### Scenario: Compatible scare near prop links it
- **GIVEN** the ghost is within the portrait’s activation radius and Nora is targetable
- **WHEN** the player starts Whisper
- **THEN** the portrait is linked to the cast
- **AND** the portrait shows casting feedback
- **AND** scare cast progress advances normally

#### Scenario: Incompatible scare near prop does not link
- **GIVEN** the ghost is within the portrait’s activation radius
- **WHEN** the player starts Cold Puff
- **THEN** the portrait is not linked
- **AND** no environmental combo is pending for that cast

#### Scenario: Out of activation range does not link
- **GIVEN** the ghost is outside every prop’s activation radius
- **WHEN** the player starts any scare
- **THEN** no prop is linked to the cast

### Requirement: Environmental combo score bonus
When a linked scare cast completes, the game SHALL award a small environmental-combo score bonus only when all of the following hold: the cast had non-zero visitor exposure; the scare category is compatible with the linked prop; the active visitor is within the prop’s visitor reaction radius at resolve; and that prop’s combo bonus has not already been awarded during the current visit. The bonus SHALL change session score only and SHALL NOT alter fear gain, fear matching, energy cost, exposure scaling, novelty, observation bonus eligibility, or visit success thresholds. A mismatched, zero-exposure, or out-of-reaction-radius resolve SHALL receive no combo bonus.

#### Scenario: Successful combo awards score once
- **GIVEN** a linked Whisper cast on the portrait completes with non-zero exposure and the visitor is in the portrait reaction radius
- **AND** the portrait combo has not been awarded this visit
- **WHEN** the outcome is applied
- **THEN** session score increases by the configured combo bonus in addition to normal scare score
- **AND** fear, energy, and novelty follow existing scare rules only

#### Scenario: Zero exposure rejects combo
- **GIVEN** a linked prop cast completes with zero exposure
- **WHEN** the outcome is applied
- **THEN** no combo bonus is awarded
- **AND** fear and energy follow existing zero-exposure rules only

#### Scenario: Visitor outside reaction radius rejects combo
- **GIVEN** a linked prop cast completes with non-zero exposure
- **AND** the visitor is outside the prop’s reaction radius
- **WHEN** the outcome is applied
- **THEN** no combo bonus is awarded

#### Scenario: Bonus only once per prop per visit
- **GIVEN** the portrait combo was already awarded this visit
- **WHEN** another valid portrait combo resolve occurs
- **THEN** the prop may still animate
- **AND** no additional combo bonus is awarded

### Requirement: Prop state resets with the visit
Hauntable prop visit state (linked cast, awarded props, presentation) SHALL reset when session-scoped visit state resets for Next visit or a new visitor becomes targetable. Prop combos SHALL NOT be available before the visitor is targetable. When visitor departure begins, active prop-cast linking and casting presentation SHALL clear along with observation and scare-cast cancellation, without awarding a combo for the cancelled cast.

#### Scenario: Reset clears awarded props
- **GIVEN** a prop combo was awarded during Nora’s visit
- **WHEN** Next visit starts Milo’s visit
- **THEN** all props are eligible for combo again
- **AND** no awarded-prop state leaks from Nora

#### Scenario: Not targetable blocks linking
- **GIVEN** the hotel is location ready and no visitor is targetable
- **WHEN** the player starts a scare near a prop
- **THEN** no prop is linked
- **AND** no combo can be awarded

#### Scenario: Departure clears prop cast presentation
- **GIVEN** a prop is linked to an active cast
- **WHEN** visitor departure begins
- **THEN** the cast is cancelled without combo award
- **AND** prop casting presentation clears

### Requirement: Pure prop and combo rules
Prop selection, compatibility, radius checks, combo eligibility, once-per-visit tracking, and reset SHALL be implemented as pure TypeScript functions independent of Phaser and SHALL NOT mutate fear, energy, novelty, exposure maths, or discovery state as a side effect.

#### Scenario: Eligibility is deterministic
- **GIVEN** identical prop, ghost, visitor, exposure, and award-state inputs
- **WHEN** combo evaluation runs twice
- **THEN** the award decision and bonus amount are the same
- **AND** fear fields are unchanged by the evaluation

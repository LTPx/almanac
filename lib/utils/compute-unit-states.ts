export type UnitState = "completed" | "available" | "locked";

type UnitForStateComputation = {
  id: number;
  position: number;
  mandatory: boolean;
};

/**
 * Computes the display state for each unit based on user progress and grid adjacency.
 * Uses a 5-column grid layout where units are adjacent if they share a row/col edge.
 * When no units are approved, the highest-position mandatory unit is marked as available
 * (learning path starts from the bottom of the grid).
 */
export function computeUnitStates(
  units: UnitForStateComputation[],
  approvedUnitIds: number[]
): Record<number, UnitState> {
  if (units.length === 0) return {};

  const approvedSet = new Set(approvedUnitIds);

  const getRowCol = (position: number) => ({
    row: Math.floor(position / 5),
    col: position % 5
  });

  const unitsWithRowCol = units.map((u) => ({
    ...u,
    ...getRowCol(u.position)
  }));

  const completedNodes = unitsWithRowCol.filter((u) => approvedSet.has(u.id));

  const isAdjacentToCompleted = (
    unit: (typeof unitsWithRowCol)[0]
  ): boolean => {
    if (completedNodes.length === 0) {
      const mandatoryUnits = units.filter((u) => u.mandatory);
      const firstUnit =
        mandatoryUnits.length > 0
          ? mandatoryUnits.reduce((max, u) =>
              u.position > max.position ? u : max
            )
          : units.reduce(
              (max, u) => (u.position > max.position ? u : max),
              units[0]
            );
      return unit.id === firstUnit?.id;
    }

    return completedNodes.some((completed) => {
      const rowDiff = Math.abs(completed.row - unit.row);
      const colDiff = Math.abs(completed.col - unit.col);
      return (
        (rowDiff === 0 && colDiff === 1) || (rowDiff === 1 && colDiff === 0)
      );
    });
  };

  const states: Record<number, UnitState> = {};
  for (const unit of unitsWithRowCol) {
    if (approvedSet.has(unit.id)) {
      states[unit.id] = "completed";
    } else if (isAdjacentToCompleted(unit)) {
      states[unit.id] = "available";
    } else {
      states[unit.id] = "locked";
    }
  }
  return states;
}

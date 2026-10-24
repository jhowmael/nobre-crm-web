import { AttentionSignalLevel, type FollowupTask } from "./types";

export interface TaskGroup {
  opportunityId: string;
  opportunityCode: string;
  company: string;
  level: AttentionSignalLevel;
  dueDate: string;
  tasks: FollowupTask[];
  reasons: string[];
}

const LEVEL_RANK: Record<AttentionSignalLevel, number> = {
  [AttentionSignalLevel.high]: 2,
  [AttentionSignalLevel.medium]: 1,
};

const rank = (level: AttentionSignalLevel) => LEVEL_RANK[level] ?? 0;

const compareTasks = (a: FollowupTask, b: FollowupTask) =>
  rank(b.level) - rank(a.level) || a.dueDate.localeCompare(b.dueDate) || a.reason.localeCompare(b.reason, "pt-BR");

export function groupTasks(tasks: FollowupTask[]): TaskGroup[] {
  const groups = new Map<string, TaskGroup>();
  for (const task of [...tasks].sort(compareTasks)) {
    const group = groups.get(task.opportunityId);
    if (!group) {
      groups.set(task.opportunityId, {
        opportunityId: task.opportunityId,
        opportunityCode: task.opportunityCode,
        company: task.company,
        level: task.level,
        dueDate: task.dueDate,
        tasks: [task],
        reasons: [task.reason],
      });
      continue;
    }
    group.tasks.push(task);
    if (!group.reasons.includes(task.reason)) group.reasons.push(task.reason);
    if (rank(task.level) > rank(group.level)) group.level = task.level;
    if (task.dueDate < group.dueDate) group.dueDate = task.dueDate;
  }
  return [...groups.values()].sort(
    (a, b) =>
      rank(b.level) - rank(a.level) ||
      a.dueDate.localeCompare(b.dueDate) ||
      b.tasks.length - a.tasks.length ||
      a.company.localeCompare(b.company, "pt-BR"),
  );
}

export const countByLevel = (groups: TaskGroup[]) => ({
  high: groups.filter((group) => group.level === AttentionSignalLevel.high).length,
  medium: groups.filter((group) => group.level === AttentionSignalLevel.medium).length,
});

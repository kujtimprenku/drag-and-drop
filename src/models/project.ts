// Project status type
export enum ProjectStatus {
  ACTIVE,
  FINISHED,
}

// Project class
export class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

namespace HrPlatform.Application.Models;

public sealed record CreateSkillRequest(string Name);

public sealed record SkillResponse(int Id, string Name);

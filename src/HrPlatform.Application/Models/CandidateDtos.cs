namespace HrPlatform.Application.Models;

public sealed record CreateCandidateRequest(
    string FullName,
    DateOnly DateOfBirth,
    string ContactNumber,
    string Email,
    IReadOnlyList<int>? SkillIds = null);

public sealed record UpdateCandidateRequest(
    string FullName,
    DateOnly DateOfBirth,
    string ContactNumber,
    string Email);

public sealed record AddSkillToCandidateRequest(int SkillId);

public sealed record CandidateResponse(
    int Id,
    string FullName,
    DateOnly DateOfBirth,
    string ContactNumber,
    string Email,
    IReadOnlyList<SkillResponse> Skills);

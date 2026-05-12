using HrPlatform.Application.Models;

namespace HrPlatform.Application.Services;

public interface ICandidateService
{
    Task<CandidateResponse> CreateAsync(CreateCandidateRequest request, CancellationToken cancellationToken = default);

    Task<CandidateResponse> UpdateAsync(int id, UpdateCandidateRequest request, CancellationToken cancellationToken = default);

    Task AddSkillAsync(int candidateId, AddSkillToCandidateRequest request, CancellationToken cancellationToken = default);

    Task RemoveSkillAsync(int candidateId, int skillId, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CandidateResponse>> SearchAsync(
        string? name,
        IReadOnlyList<string>? skills,
        CancellationToken cancellationToken = default);

    Task<CandidateResponse> GetByIdAsync(int id, CancellationToken cancellationToken = default);
}

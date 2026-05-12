using HrPlatform.Application.Models;

namespace HrPlatform.Application.Services;

public interface ISkillService
{
    Task<IReadOnlyList<SkillResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<SkillResponse> CreateAsync(CreateSkillRequest request, CancellationToken cancellationToken = default);

    Task<SkillResponse> GetByIdAsync(int id, CancellationToken cancellationToken = default);
}

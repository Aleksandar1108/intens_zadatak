using HrPlatform.Application.Exceptions;
using HrPlatform.Application.Models;
using HrPlatform.Application.Validation;
using HrPlatform.Domain.Entities;
using HrPlatform.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrPlatform.Application.Services;

public sealed class SkillService : ISkillService
{
    private readonly ApplicationDbContext _db;

    public SkillService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<SkillResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Skills
            .AsNoTracking()
            .OrderBy(s => s.Name)
            .Select(s => new SkillResponse(s.Id, s.Name))
            .ToListAsync(cancellationToken);
    }

    public async Task<SkillResponse> CreateAsync(CreateSkillRequest request, CancellationToken cancellationToken = default)
    {
        var name = InputGuard.RequireNonEmpty(request.Name, "Skill name");
        if (name.Length > 128)
        {
            throw new ValidationException("Skill name must be at most 128 characters.");
        }

        var exists = await _db.Skills.AnyAsync(
            s => s.Name.ToLower() == name.ToLower(),
            cancellationToken);
        if (exists)
        {
            throw new ConflictException("A skill with the same name already exists.");
        }

        var entity = new Skill { Name = name };
        _db.Skills.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        return new SkillResponse(entity.Id, entity.Name);
    }

    public async Task<SkillResponse> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _db.Skills.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException("Skill was not found.");
        }

        return new SkillResponse(entity.Id, entity.Name);
    }
}

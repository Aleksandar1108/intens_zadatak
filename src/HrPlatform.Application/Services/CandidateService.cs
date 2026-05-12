using HrPlatform.Application.Exceptions;
using HrPlatform.Application.Models;
using HrPlatform.Application.Validation;
using HrPlatform.Domain.Entities;
using HrPlatform.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrPlatform.Application.Services;

public sealed class CandidateService : ICandidateService
{
    private readonly ApplicationDbContext _db;

    public CandidateService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<CandidateResponse> CreateAsync(CreateCandidateRequest request, CancellationToken cancellationToken = default)
    {
        var fullName = InputGuard.RequireNonEmpty(request.FullName, "Full name");
        if (fullName.Length > 256)
        {
            throw new ValidationException("Full name must be at most 256 characters.");
        }

        InputGuard.RequireValidEmail(request.Email);
        var email = request.Email.Trim();

        var contact = InputGuard.RequireNonEmpty(request.ContactNumber, "Contact number");
        if (contact.Length > 32)
        {
            throw new ValidationException("Contact number must be at most 32 characters.");
        }

        var emailTaken = await _db.Candidates.AnyAsync(c => c.Email.ToLower() == email.ToLower(), cancellationToken);
        if (emailTaken)
        {
            throw new ConflictException("A candidate with this email already exists.");
        }

        var skillIds = request.SkillIds ?? Array.Empty<int>();
        var distinctIds = skillIds.Distinct().ToList();
        if (distinctIds.Count > 0)
        {
            var found = await _db.Skills.Where(s => distinctIds.Contains(s.Id)).Select(s => s.Id).ToListAsync(cancellationToken);
            if (found.Count != distinctIds.Count)
            {
                throw new NotFoundException("One or more skills were not found.");
            }
        }

        var candidate = new Candidate
        {
            FullName = fullName,
            DateOfBirth = request.DateOfBirth,
            ContactNumber = contact,
            Email = email,
        };

        foreach (var sid in distinctIds)
        {
            candidate.CandidateSkills.Add(new CandidateSkill { SkillId = sid });
        }

        _db.Candidates.Add(candidate);
        await _db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(candidate.Id, cancellationToken);
    }

    public async Task<CandidateResponse> UpdateAsync(int id, UpdateCandidateRequest request, CancellationToken cancellationToken = default)
    {
        var candidate = await _db.Candidates.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (candidate is null)
        {
            throw new NotFoundException("Candidate was not found.");
        }

        var fullName = InputGuard.RequireNonEmpty(request.FullName, "Full name");
        if (fullName.Length > 256)
        {
            throw new ValidationException("Full name must be at most 256 characters.");
        }

        InputGuard.RequireValidEmail(request.Email);
        var email = request.Email.Trim();

        var contact = InputGuard.RequireNonEmpty(request.ContactNumber, "Contact number");
        if (contact.Length > 32)
        {
            throw new ValidationException("Contact number must be at most 32 characters.");
        }

        var emailTaken = await _db.Candidates.AnyAsync(
            c => c.Id != id && c.Email.ToLower() == email.ToLower(),
            cancellationToken);
        if (emailTaken)
        {
            throw new ConflictException("Another candidate already uses this email.");
        }

        candidate.FullName = fullName;
        candidate.DateOfBirth = request.DateOfBirth;
        candidate.ContactNumber = contact;
        candidate.Email = email;

        await _db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task AddSkillAsync(int candidateId, AddSkillToCandidateRequest request, CancellationToken cancellationToken = default)
    {
        var candidateExists = await _db.Candidates.AnyAsync(c => c.Id == candidateId, cancellationToken);
        if (!candidateExists)
        {
            throw new NotFoundException("Candidate was not found.");
        }

        var skillExists = await _db.Skills.AnyAsync(s => s.Id == request.SkillId, cancellationToken);
        if (!skillExists)
        {
            throw new NotFoundException("Skill was not found.");
        }

        var alreadyLinked = await _db.CandidateSkills.AnyAsync(
            cs => cs.CandidateId == candidateId && cs.SkillId == request.SkillId,
            cancellationToken);
        if (alreadyLinked)
        {
            throw new ConflictException("This skill is already assigned to the candidate.");
        }

        _db.CandidateSkills.Add(new CandidateSkill { CandidateId = candidateId, SkillId = request.SkillId });
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveSkillAsync(int candidateId, int skillId, CancellationToken cancellationToken = default)
    {
        var link = await _db.CandidateSkills.FirstOrDefaultAsync(
            cs => cs.CandidateId == candidateId && cs.SkillId == skillId,
            cancellationToken);
        if (link is null)
        {
            throw new NotFoundException("The candidate does not have this skill assigned.");
        }

        _db.CandidateSkills.Remove(link);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var candidate = await _db.Candidates.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (candidate is null)
        {
            throw new NotFoundException("Candidate was not found.");
        }

        _db.Candidates.Remove(candidate);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CandidateResponse>> SearchAsync(
        string? name,
        IReadOnlyList<string>? skills,
        CancellationToken cancellationToken = default)
    {
        var query = _db.Candidates
            .AsNoTracking()
            .Include(c => c.CandidateSkills)
            .ThenInclude(cs => cs.Skill)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(name))
        {
            var term = name.Trim().ToLower();
            query = query.Where(c => c.FullName.ToLower().Contains(term));
        }

        if (skills is { Count: > 0 })
        {
            var normalized = skills
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(s => s.Trim().ToLower())
                .Distinct()
                .ToList();

            foreach (var skillName in normalized)
            {
                query = query.Where(c => c.CandidateSkills.Any(cs => cs.Skill.Name.ToLower() == skillName));
            }
        }

        var list = await query
            .OrderBy(c => c.FullName)
            .ToListAsync(cancellationToken);

        return list.Select(Map).ToList();
    }

    public async Task<CandidateResponse> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _db.Candidates
            .AsNoTracking()
            .Include(c => c.CandidateSkills)
            .ThenInclude(cs => cs.Skill)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException("Candidate was not found.");
        }

        return Map(entity);
    }

    private static CandidateResponse Map(Candidate c)
    {
        var skills = c.CandidateSkills
            .OrderBy(cs => cs.Skill.Name)
            .Select(cs => new SkillResponse(cs.Skill.Id, cs.Skill.Name))
            .ToList();

        return new CandidateResponse(
            c.Id,
            c.FullName,
            c.DateOfBirth,
            c.ContactNumber,
            c.Email,
            skills);
    }
}

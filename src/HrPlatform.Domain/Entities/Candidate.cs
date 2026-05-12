namespace HrPlatform.Domain.Entities;

public class Candidate
{
    public int Id { get; set; }

    public string FullName { get; set; } = null!;

    public DateOnly DateOfBirth { get; set; }

    public string ContactNumber { get; set; } = null!;

    public string Email { get; set; } = null!;

    public ICollection<CandidateSkill> CandidateSkills { get; set; } = new List<CandidateSkill>();
}

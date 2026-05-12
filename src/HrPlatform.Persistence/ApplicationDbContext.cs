using HrPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HrPlatform.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Candidate> Candidates => Set<Candidate>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<CandidateSkill> CandidateSkills => Set<CandidateSkill>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}

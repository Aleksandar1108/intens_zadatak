using HrPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrPlatform.Persistence.Configurations;

public class CandidateSkillConfiguration : IEntityTypeConfiguration<CandidateSkill>
{
    public void Configure(EntityTypeBuilder<CandidateSkill> builder)
    {
        builder.ToTable("CandidateSkills");

        builder.HasKey(cs => new { cs.CandidateId, cs.SkillId });

        builder.HasIndex(cs => cs.SkillId)
            .HasDatabaseName("IX_CandidateSkills_SkillId");
    }
}

using HrPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrPlatform.Persistence.Configurations;

public class SkillConfiguration : IEntityTypeConfiguration<Skill>
{
    public void Configure(EntityTypeBuilder<Skill> builder)
    {
        builder.ToTable("Skills");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(128)
            .UseCollation("NOCASE");

        builder.HasIndex(s => s.Name)
            .IsUnique()
            .HasDatabaseName("IX_Skills_Name");

        builder.HasMany(s => s.CandidateSkills)
            .WithOne(cs => cs.Skill)
            .HasForeignKey(cs => cs.SkillId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

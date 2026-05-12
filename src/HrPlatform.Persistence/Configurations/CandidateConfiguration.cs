using HrPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrPlatform.Persistence.Configurations;

public class CandidateConfiguration : IEntityTypeConfiguration<Candidate>
{
    public void Configure(EntityTypeBuilder<Candidate> builder)
    {
        builder.ToTable("Candidates");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.FullName)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(c => c.DateOfBirth)
            .IsRequired();

        builder.Property(c => c.ContactNumber)
            .IsRequired()
            .HasMaxLength(32);

        builder.Property(c => c.Email)
            .IsRequired()
            .HasMaxLength(256)
            .UseCollation("NOCASE");

        builder.HasIndex(c => c.Email)
            .IsUnique()
            .HasDatabaseName("IX_Candidates_Email");

        builder.HasMany(c => c.CandidateSkills)
            .WithOne(cs => cs.Candidate)
            .HasForeignKey(cs => cs.CandidateId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

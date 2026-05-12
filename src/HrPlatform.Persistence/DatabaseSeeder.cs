using HrPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HrPlatform.Persistence;

public static class DatabaseSeeder
{
    private static readonly string[] SeedSkillNames =
    [
        "Java programming",
        "C# programming",
        "Database design",
        "English",
        "Russian",
        "German language",
        "React",
        "ASP.NET Core",
    ];

    public static async Task SeedAsync(ApplicationDbContext db, CancellationToken cancellationToken = default)
    {
        if (!await db.Skills.AnyAsync(cancellationToken))
        {
            db.Skills.AddRange(SeedSkillNames.Select(n => new Skill { Name = n }));
            await db.SaveChangesAsync(cancellationToken);
        }

        if (await db.Candidates.AnyAsync(cancellationToken))
        {
            return;
        }

        var byName = await db.Skills.AsNoTracking().ToDictionaryAsync(s => s.Name, s => s.Id, cancellationToken);

        static bool HasAll(Dictionary<string, int> map, params string[] names) =>
            names.All(n => map.ContainsKey(n));

        if (!HasAll(byName, "C# programming", "ASP.NET Core", "Database design", "English"))
        {
            return;
        }

        var candidates = new List<Candidate>
        {
            new()
            {
                FullName = "Mila Petrović",
                DateOfBirth = new DateOnly(1996, 7, 22),
                ContactNumber = "+381641112233",
                Email = "mila.petrovic@example.com",
            },
            new()
            {
                FullName = "Stefan Nikolić",
                DateOfBirth = new DateOnly(1994, 11, 3),
                ContactNumber = "+381642223344",
                Email = "stefan.nikolic@example.com",
            },
            new()
            {
                FullName = "Elena Kovač",
                DateOfBirth = new DateOnly(1999, 2, 18),
                ContactNumber = "+381653334455",
                Email = "elena.kovac@example.com",
            },
        };

        db.Candidates.AddRange(candidates);
        await db.SaveChangesAsync(cancellationToken);

        var mila = await db.Candidates.FirstAsync(c => c.Email == "mila.petrovic@example.com", cancellationToken);
        var stefan = await db.Candidates.FirstAsync(c => c.Email == "stefan.nikolic@example.com", cancellationToken);
        var elena = await db.Candidates.FirstAsync(c => c.Email == "elena.kovac@example.com", cancellationToken);

        void Link(Candidate c, params string[] names)
        {
            foreach (var n in names)
            {
                if (byName.TryGetValue(n, out var id))
                {
                    c.CandidateSkills.Add(new CandidateSkill { SkillId = id });
                }
            }
        }

        if (HasAll(byName, "C# programming", "ASP.NET Core", "Database design", "English"))
        {
            Link(mila, "C# programming", "ASP.NET Core", "Database design", "English");
        }

        if (HasAll(byName, "Java programming", "Database design", "German language", "English"))
        {
            Link(stefan, "Java programming", "Database design", "German language", "English");
        }

        if (HasAll(byName, "React", "C# programming", "English", "Russian"))
        {
            Link(elena, "React", "C# programming", "English", "Russian");
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}

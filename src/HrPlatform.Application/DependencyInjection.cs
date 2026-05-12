using HrPlatform.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace HrPlatform.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ICandidateService, CandidateService>();
        services.AddScoped<ISkillService, SkillService>();
        return services;
    }
}

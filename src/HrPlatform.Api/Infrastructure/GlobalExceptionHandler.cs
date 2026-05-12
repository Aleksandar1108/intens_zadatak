using HrPlatform.Application.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace HrPlatform.Api.Infrastructure;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not AppException)
        {
            _logger.LogError(exception, "Unhandled exception");
        }

        var problem = Map(exception);
        httpContext.Response.StatusCode = problem.Status ?? StatusCodes.Status500InternalServerError;
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
        return true;
    }

    private static ProblemDetails Map(Exception exception)
    {
        return exception switch
        {
            ValidationException ve => new ProblemDetails
            {
                Title = "Invalid request",
                Detail = ve.Message,
                Status = StatusCodes.Status400BadRequest,
            },
            NotFoundException ne => new ProblemDetails
            {
                Title = "Resource not found",
                Detail = ne.Message,
                Status = StatusCodes.Status404NotFound,
            },
            ConflictException ce => new ProblemDetails
            {
                Title = "Conflict",
                Detail = ce.Message,
                Status = StatusCodes.Status409Conflict,
            },
            _ => new ProblemDetails
            {
                Title = "Unexpected error",
                Detail = "An unexpected error occurred.",
                Status = StatusCodes.Status500InternalServerError,
            },
        };
    }
}

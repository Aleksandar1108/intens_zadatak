using System.Net.Mail;
using HrPlatform.Application.Exceptions;

namespace HrPlatform.Application.Validation;

internal static class InputGuard
{
    public static string RequireNonEmpty(string value, string fieldName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ValidationException($"{fieldName} is required.");
        }

        return value.Trim();
    }

    public static void RequireValidEmail(string email)
    {
        var trimmed = RequireNonEmpty(email, "Email");
        try
        {
            _ = new MailAddress(trimmed);
        }
        catch (FormatException)
        {
            throw new ValidationException("Email is not valid.");
        }
    }
}

using HrPlatform.Application.Models;
using HrPlatform.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace HrPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CandidatesController : ControllerBase
{
    private readonly ICandidateService _candidates;

    public CandidatesController(ICandidateService candidates)
    {
        _candidates = candidates;
    }

    [HttpPost]
    [ProducesResponseType(typeof(CandidateResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CandidateResponse>> Create([FromBody] CreateCandidateRequest request, CancellationToken cancellationToken)
    {
        var created = await _candidates.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(CandidateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CandidateResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var candidate = await _candidates.GetByIdAsync(id, cancellationToken);
        return Ok(candidate);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(CandidateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CandidateResponse>> Update(
        int id,
        [FromBody] UpdateCandidateRequest request,
        CancellationToken cancellationToken)
    {
        var updated = await _candidates.UpdateAsync(id, request, cancellationToken);
        return Ok(updated);
    }

    [HttpPost("{id:int}/skills")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> AddSkill(
        int id,
        [FromBody] AddSkillToCandidateRequest request,
        CancellationToken cancellationToken)
    {
        await _candidates.AddSkillAsync(id, request, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{candidateId:int}/skills/{skillId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveSkill(int candidateId, int skillId, CancellationToken cancellationToken)
    {
        await _candidates.RemoveSkillAsync(candidateId, skillId, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _candidates.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpGet("search")]
    [ProducesResponseType(typeof(IReadOnlyList<CandidateResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CandidateResponse>>> Search(
        [FromQuery] string? name,
        [FromQuery(Name = "skill")] List<string>? skill,
        CancellationToken cancellationToken)
    {
        IReadOnlyList<string>? skills = skill is { Count: > 0 } ? skill : null;
        var results = await _candidates.SearchAsync(name, skills, cancellationToken);
        return Ok(results);
    }
}

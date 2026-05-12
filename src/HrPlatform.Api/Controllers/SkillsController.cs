using HrPlatform.Application.Models;
using HrPlatform.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace HrPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class SkillsController : ControllerBase
{
    private readonly ISkillService _skills;

    public SkillsController(ISkillService skills)
    {
        _skills = skills;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SkillResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SkillResponse>>> List(CancellationToken cancellationToken)
    {
        var list = await _skills.GetAllAsync(cancellationToken);
        return Ok(list);
    }

    [HttpPost]
    [ProducesResponseType(typeof(SkillResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<SkillResponse>> Create([FromBody] CreateSkillRequest request, CancellationToken cancellationToken)
    {
        var created = await _skills.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(SkillResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SkillResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var skill = await _skills.GetByIdAsync(id, cancellationToken);
        return Ok(skill);
    }
}

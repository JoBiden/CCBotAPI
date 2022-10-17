using CCBotAPI.Models;
using CCBotAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace CCBotAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IdentifierController : ControllerBase
    {
        private readonly IdentifierService _identifierService;

        public IdentifierController(IdentifierService identifierService) =>
            _identifierService = identifierService;

        [HttpGet]
        public async Task<List<Identifier>> Get() =>
            await _identifierService.GetAsync();

        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<Identifier>> Get(string id)
        {
            var identifier = await _identifierService.GetAsync(id);

            if (identifier is null)
            {
                return NotFound();
            }

            return identifier;
        }

        [HttpPost]
        public async Task<IActionResult> Post(Identifier newIdentifier)
        {
            await _identifierService.CreateAsync(newIdentifier);

            return CreatedAtAction(nameof(Get), new { id = newIdentifier.Id }, newIdentifier);
        }

        [HttpPut("{id:length(24)}")]
        public async Task<IActionResult> Update(string id, Identifier updatedIdentifier)
        {
            var identifier = await _identifierService.GetAsync(id);

            if (identifier is null)
            {
                return NotFound();
            }

            updatedIdentifier.Id = identifier.Id;

            await _identifierService.UpdateAsync(id, updatedIdentifier);

            return NoContent();
        }

        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var identifier = await _identifierService.GetAsync(id);

            if (identifier is null)
            {
                return NotFound();
            }

            await _identifierService.RemoveAsync(id);

            return NoContent();
        }
    }
}

using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using System;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Chemistry_Cafe_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReactantProductListController : ControllerBase
    {
        private ReactantProductListService userpreferencesService;

        //Injects sql data source setup in Program.cs
        public ReactantProductListController([FromServices] MySqlDataSource db)
        {
            this.userpreferencesService = new ReactantProductListService(db);
        }

        // GET: api/ReactantProductList/all
        [HttpGet("all")]
        public async Task<IReadOnlyList<ReactantProductList>> Get()
        {
            return await userpreferencesService.GetReactantProductListsAsync();
        }

        // GET api/ReactantProductList/5
        [HttpGet("{uuid}")]
        public async Task<ReactantProductList?> Get(Guid uuid)
        {
            return await userpreferencesService.GetReactantProductListAsync(uuid);
        }

        // GET api/ReactantProductList/Reactants/5
        [HttpGet("Reactants/{reaction_reactant_list_uuid}")]
        public async Task<IReadOnlyList<ReactantsProducts>> GetReactants(Guid reaction_reactant_list_uuid)
        {
            return await userpreferencesService.GetReactantsAsync(reaction_reactant_list_uuid);
        }

        // GET api/ReactantProductList/Products/5
        [HttpGet("Products/{reaction_product_list_uuid}")]
        public async Task<IReadOnlyList<ReactantsProducts>> GetProducts(Guid reaction_product_list_uuid)
        {
            return await userpreferencesService.GetProductsAsync(reaction_product_list_uuid);
        }

        // POST api/ReactantProductList/create
        [HttpPost("create")]
        public async Task Create([FromBody] ReactantProductList reactantProduct)
        {
            await userpreferencesService.CreateReactantProductListAsync(reactantProduct);
        }

        // PUT api/ReactantProductList/5
        [HttpPut("update")]
        public async Task Put([FromBody] ReactantProductList reactantProductList)
        {
            await userpreferencesService.UpdateReactantProductListAsync(reactantProductList);
        }

        // DELETE api/ReactantProductList/delete  Body [reaction_product_uuid, species_uuid]
        [HttpDelete("delete")]
        public async Task Delete([FromBody]DeleteReactantProductList uuid)
        {
            await userpreferencesService.DeleteReactantProductListAsync(uuid);
        }
    }
}

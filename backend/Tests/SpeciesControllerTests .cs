using Chemistry_Cafe_API.Controllers;
using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MySqlConnector;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Chemistry_Cafe_API.Tests
{
    [TestClass]
    public class SpeciesControllerTests
    {
        readonly MySqlDataSource db = DBConnection.DataSource;
        
        [TestMethod]
        public async Task Get_retrieves_species()
        {
            Console.WriteLine(db.ConnectionString);
            var speciesService = new SpeciesService(db);
            var controller = new SpeciesController(speciesService);

            var actionResult = await controller.GetSpecies();

            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var speciesList = okResult.Value as IEnumerable<Species>;
            Assert.IsNotNull(speciesList);
        }

        // [TestMethod]
        // public async Task Creates_species()
        // {
        //     var controller = new SpeciesController(db);

        //     var result = await controller.Create("Test") ;

        //     var getResult = await controller.Get(result);

        //     Assert.AreEqual(result, getResult.uuid);
        // }

        // [TestMethod]
        // public async Task Updates_species()
        // {
        //     var controller = new SpeciesController(db);

        //     var result = await controller.Create("Test");

        //     var getResult = await controller.Get(result);

        //     getResult.type = "Edited";

        //     await controller.Put(getResult);

        //     var getEditedResult = await controller.Get(result);

        //     await controller.Delete(result);

        //     Assert.AreEqual(getEditedResult.type, "Edited");
        // }
    }
}

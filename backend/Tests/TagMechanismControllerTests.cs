﻿using Chemistry_Cafe_API.Controllers;
using Chemistry_Cafe_API.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MySqlConnector;

namespace Chemistry_Cafe_API.Tests
{
    [TestClass]
    public class TagMechanismControllerTests
    {
        readonly MySqlDataSource db = DBConnection.DataSource;
        
        [TestMethod]
        public async Task Get_retrieves_tagmechanism()
        {
            var controller = new TagMechanismController(db);

            var result = await controller.Get() as List<TagMechanism>;

            Assert.IsNotNull(result);
        }

        [TestMethod]
        public async Task Get_retrieves_tagmechanism_family()
        {
            var controller = new TagMechanismController(db);

            var guid = new Guid("06b7c16f-eb1a-49ef-8798-16fe03fc67ae");

            var result = await controller.GetTags(guid) as List<TagMechanism>;

            Assert.IsNotNull(result);
        }

        [TestMethod]
        public async Task Creates_tagmechanism()
        {
            var controller = new TagMechanismController(db);

            var result = await controller.Create("Test") ;

            var getResult = await controller.Get(result);

            Assert.AreEqual(result, getResult.uuid);
        }

        [TestMethod]
        public async Task Updates_tagmechanism()
        {
            var controller = new TagMechanismController(db);

            var result = await controller.Create("Test");

            var getResult = await controller.Get(result);

            getResult.tag = "Edited";

            await controller.Put(getResult);

            var getEditedResult = await controller.Get(result);

            await controller.Delete(result);

            Assert.AreEqual(getEditedResult.tag, "Edited");
        }
    }
}
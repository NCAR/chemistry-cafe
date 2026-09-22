using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ChemistryCafeAPI.Controllers;
using ChemistryCafeAPI.Services;
using ChemistryCafeAPI.Models;
using MySqlConnector;
using System;
using System.Linq;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Tests
{
    [TestClass]
    public class GoogleOAuthControllerTests
    {
        readonly ChemistryDbContext ctx = DBConnection.Context;
        
        [TestMethod]
        public Task LoginNonnull()
        {
            var userService = new UserService(ctx);
            var googleService = new GoogleOAuthService(userService);
            var googleController = new GoogleOAuthController(googleService);
            Assert.IsNotNull(googleController.LoginRedirect());
            return Task.CompletedTask;
        }
    }
}

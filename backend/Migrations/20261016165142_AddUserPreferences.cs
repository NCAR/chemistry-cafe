using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChemistryCafeAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserPreferences",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ArrheniusRateUnits = table.Column<int>(type: "int", nullable: false),
                    BranchedRateUnits = table.Column<int>(type: "int", nullable: false),
                    TaylorSeriesRateUnits = table.Column<int>(type: "int", nullable: false),
                    TernaryChemicalActivationRateUnits = table.Column<int>(type: "int", nullable: false),
                    TroeRateUnits = table.Column<int>(type: "int", nullable: false),
                    TunnelingRateUnits = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPreferences", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserPreferences_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserPreferences");
        }
    }
}

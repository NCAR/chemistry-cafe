using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChemistryCafeAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddTernaryChemicalActivationParameters : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TernaryChemicalActivationParameters",
                columns: table => new
                {
                    ReactionId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    K0A = table.Column<double>(type: "double", nullable: true),
                    K0B = table.Column<double>(type: "double", nullable: true),
                    K0C = table.Column<double>(type: "double", nullable: true),
                    KinfA = table.Column<double>(type: "double", nullable: true),
                    KinfB = table.Column<double>(type: "double", nullable: true),
                    KinfC = table.Column<double>(type: "double", nullable: true),
                    Fc = table.Column<double>(type: "double", nullable: true),
                    N = table.Column<double>(type: "double", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TernaryChemicalActivationParameters", x => x.ReactionId);
                    table.ForeignKey(
                        name: "FK_TernaryChemicalActivationParameters_Reactions_ReactionId",
                        column: x => x.ReactionId,
                        principalTable: "Reactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TernaryChemicalActivationParameters");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChemistryCafeAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddTaylorSeriesParameters : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TaylorSeriesParameters",
                columns: table => new
                {
                    ReactionId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    A = table.Column<double>(type: "double", nullable: true),
                    B = table.Column<double>(type: "double", nullable: true),
                    C = table.Column<double>(type: "double", nullable: true),
                    Ea = table.Column<double>(type: "double", nullable: true),
                    D = table.Column<double>(type: "double", nullable: true),
                    E = table.Column<double>(type: "double", nullable: true),
                    TaylorCoefficients = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaylorSeriesParameters", x => x.ReactionId);
                    table.ForeignKey(
                        name: "FK_TaylorSeriesParameters_Reactions_ReactionId",
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
                name: "TaylorSeriesParameters");
        }
    }
}

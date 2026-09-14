using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChemistryCafeAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddArrheniusParameters : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ArrheniusParameters",
                columns: table => new
                {
                    ReactionId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    A = table.Column<double>(type: "double", nullable: true),
                    B = table.Column<double>(type: "double", nullable: true),
                    C = table.Column<double>(type: "double", nullable: true),
                    Ea = table.Column<double>(type: "double", nullable: true),
                    D = table.Column<double>(type: "double", nullable: true),
                    E = table.Column<double>(type: "double", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArrheniusParameters", x => x.ReactionId);
                    table.ForeignKey(
                        name: "FK_ArrheniusParameters_Reactions_ReactionId",
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
                name: "ArrheniusParameters");
        }
    }
}

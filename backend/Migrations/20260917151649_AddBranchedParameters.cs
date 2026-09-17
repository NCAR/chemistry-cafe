using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChemistryCafeAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddBranchedParameters : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BranchedParameters",
                columns: table => new
                {
                    ReactionId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    X = table.Column<double>(type: "double", nullable: true),
                    Y = table.Column<double>(type: "double", nullable: true),
                    A0 = table.Column<double>(type: "double", nullable: true),
                    N = table.Column<double>(type: "double", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BranchedParameters", x => x.ReactionId);
                    table.ForeignKey(
                        name: "FK_BranchedParameters_Reactions_ReactionId",
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
                name: "BranchedParameters");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChemistryCafeAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddVerifiedMechanismVersions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SourceObjectId",
                table: "Species",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<Guid>(
                name: "SourceObjectId",
                table: "Reactions",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<Guid>(
                name: "SourceObjectId",
                table: "Phases",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<Guid>(
                name: "SourceObjectId",
                table: "Mechanisms",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.CreateTable(
                name: "VerifiedMechanismVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    FamilyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    FamilyVersionId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    SourceMechanismId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    MechanismId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Notes = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VerifiedDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    VerifierId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    IsDeprecated = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    DeprecationReason = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DeprecatedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    DeprecatedById = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    BetterVersionId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    DeprecationHistoryJson = table.Column<string>(type: "json", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsArchived = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ArchivedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ArchivedById = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    OriginalFamilyId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    OriginalFamilyName = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OriginalOwnerId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    OriginalOwnerUsername = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VerifiedMechanismVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VerifiedMechanismVersions_Families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "Families",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VerifiedMechanismVersions_FamilyVersions_FamilyVersionId",
                        column: x => x.FamilyVersionId,
                        principalTable: "FamilyVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VerifiedMechanismVersions_Mechanisms_MechanismId",
                        column: x => x.MechanismId,
                        principalTable: "Mechanisms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VerifiedMechanismVersions_Users_ArchivedById",
                        column: x => x.ArchivedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_VerifiedMechanismVersions_Users_DeprecatedById",
                        column: x => x.DeprecatedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_VerifiedMechanismVersions_Users_VerifierId",
                        column: x => x.VerifierId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_VerifiedMechanismVersions_ArchivedById",
                table: "VerifiedMechanismVersions",
                column: "ArchivedById");

            migrationBuilder.CreateIndex(
                name: "IX_VerifiedMechanismVersions_DeprecatedById",
                table: "VerifiedMechanismVersions",
                column: "DeprecatedById");

            migrationBuilder.CreateIndex(
                name: "IX_VerifiedMechanismVersions_FamilyId",
                table: "VerifiedMechanismVersions",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_VerifiedMechanismVersions_FamilyVersionId",
                table: "VerifiedMechanismVersions",
                column: "FamilyVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_VerifiedMechanismVersions_MechanismId",
                table: "VerifiedMechanismVersions",
                column: "MechanismId");

            migrationBuilder.CreateIndex(
                name: "IX_VerifiedMechanismVersions_VerifierId",
                table: "VerifiedMechanismVersions",
                column: "VerifierId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VerifiedMechanismVersions");

            migrationBuilder.DropColumn(
                name: "SourceObjectId",
                table: "Species");

            migrationBuilder.DropColumn(
                name: "SourceObjectId",
                table: "Reactions");

            migrationBuilder.DropColumn(
                name: "SourceObjectId",
                table: "Phases");

            migrationBuilder.DropColumn(
                name: "SourceObjectId",
                table: "Mechanisms");
        }
    }
}

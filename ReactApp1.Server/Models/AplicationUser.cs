using AspNetCore.Identity.MongoDbCore.Models;
using MongoDB.Bson;
using System;

namespace ReactApp1.Server.Models
{
    public class ApplicationUser : MongoIdentityUser<string>
    {
        public ApplicationUser() : base()
        {
        }

        public ApplicationUser(string userName, string email) : base(userName, email)
        {
        }

        public string Nombre { get; set; }
        public List<string> FallecidosIds { get; set; } = new List<string>();
    }
}

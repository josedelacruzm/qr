using AspNetCore.Identity.MongoDbCore.Models;
using MongoDbGenericRepository.Attributes;
using System;

namespace ReactApp1.Server.Models
{
    [CollectionName("Roles")]
    public class ApplicationRole : MongoIdentityRole<string>
    {
        public ApplicationRole() : base()
        {
        }

        public ApplicationRole(string roleName) : base(roleName)
        {
        }
    }
}

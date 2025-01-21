namespace ReactApp1.Server.Models
{
    public class MongoDbSettings
    {
        public string ConnectionString { get; set; }
        public string DatabaseName { get; set; }

        public string UsuarioCollectionName { get; set; }
        public string FallecidoCollectionName { get; set; }
    }
}

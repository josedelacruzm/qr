using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ReactApp1.Server.Models
{
    public class Fallecido
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("nombre")]
        public string Nombre { get; set; }

        [BsonElement("genero")]
        public string Genero { get; set; }

        [BsonElement("fechanacimiento")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc, DateOnly = true)]
        public DateTime FechaNacimiento { get; set; }

        [BsonElement("lugarnacimiento")]
        public string LugarNacimiento { get; set; }

        [BsonElement("fechafallecimiento")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc, DateOnly = true)]
        public DateTime FechaFallecimiento { get; set; }

        [BsonElement("lugarfallecimiento")]
        public string LugarFallecimiento { get; set; }

        [BsonElement("imagen")]
        public byte[] ImagenFallecido { get; set; }

        [BsonElement("biografia")]
        public string Biografia { get; set; }

        [BsonElement("cementerio")]
        public string DireccionCementerio { get; set; }

        [BsonElement("relaciones")]
        public List<Relacion> Relaciones { get; set; } = new List<Relacion>();
    }

    public class Relacion
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string Fallecido1Id { get; set; }
        public string Fallecido2Id { get; set; }
        public string TipoRelacion1 {  get; set; }
        public string TipoRelacion2 { get; set; }
    }


}
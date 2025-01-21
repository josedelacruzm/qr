using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MongoDB.Bson;
using ReactApp1.Server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.IO;
using Amazon.Runtime.Internal;

namespace ReactApp1.Server.Services
{
    public class FallecidoServices
    {
        private readonly IMongoCollection<Fallecido> _fallecidoCollection;
        private readonly IMongoCollection<Relacion> _relacionCollection;


        public FallecidoServices(IMongoDatabase database)
        {
            _fallecidoCollection = database.GetCollection<Fallecido>("Fallecido");
            _relacionCollection = database.GetCollection<Relacion>("Relacion");
        }

        public async Task<List<Fallecido>> GetFallecidosByIdsAsync(List<string> ids)
        {
            return await _fallecidoCollection.Find(f => ids.Contains(f.Id)).ToListAsync();
        }
        public async Task<List<Fallecido>> GetAllFallecidosAsync()
        {
            // Recupera todos los fallecidos de la colección
            return await _fallecidoCollection.Find(f => true).ToListAsync();
        }
        public async Task<Fallecido> GetAsync(string id)
        {
            return await _fallecidoCollection.Find(f => f.Id == id).FirstOrDefaultAsync();
        }

        public async Task<Fallecido> CreateAsync(Fallecido fallecido)
        {
            await _fallecidoCollection.InsertOneAsync(fallecido);
            return fallecido;
        }

        public async Task<bool> UpdateAsync(string id, string fieldName, object newValue)
        {
            // Usa el operador $set para actualizar solo el campo específico
            var updateDefinition = Builders<Fallecido>.Update.Set(fieldName, newValue);

            var result = await _fallecidoCollection.UpdateOneAsync(
                f => f.Id == id,
                updateDefinition
            );

            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _fallecidoCollection.DeleteOneAsync(f => f.Id == id);
            return result.DeletedCount > 0;
        }

        public async Task<List<Fallecido>> SearchFallecidosByNameAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return new List<Fallecido>();

             var filter = Builders<Fallecido>.Filter.Regex(
            f => f.Nombre,
            new BsonRegularExpression($".*{searchTerm}.*", "i")
        );

            return await _fallecidoCollection
            .Find(filter)
            .ToListAsync();
        }



        public async Task AddRelacionAsync(Relacion relacion)
        {
            await _relacionCollection.InsertOneAsync(relacion);
        }

        public async Task UpdateRelacionAsync(string id, Relacion updatedRelacion)
        {
            await _relacionCollection.ReplaceOneAsync(r => r.Id == id, updatedRelacion);
        }

        public async Task<List<object>> GetRelacionByFallecidoIdAsync(string fallecidoId,string baseUrl)
        {
            // Obtener las relaciones donde fallecidoId es Fallecido1 o Fallecido2
            var relaciones = await _relacionCollection.Find(r =>
                r.Fallecido1Id == fallecidoId || r.Fallecido2Id == fallecidoId).ToListAsync();

            var resultado = new List<object>();


            foreach (var relacion in relaciones)
            {
                // Determinar el ID del fallecido relacionado
                var fallecidoRelacionadoId = relacion.Fallecido1Id == fallecidoId
                    ? relacion.Fallecido2Id
                    : relacion.Fallecido1Id;

                // Obtener los datos del fallecido relacionado
                var fallecidoRelacionado = await GetAsync(fallecidoRelacionadoId);
                var fallecidoFolderPath = Path.Combine("uploads", "fallecidos", fallecidoRelacionadoId);

                // Rutas de archivos individuales
                var imageDirectory = Path.Combine(fallecidoFolderPath, "image");
                var imagePath = Directory.GetFiles(imageDirectory, "perfil_*")
                                    .FirstOrDefault()
                                    ?? Path.Combine(imageDirectory, "perfil.jpg");

                // Construir el resultado
                resultado.Add(new
                {
                    relacion.Id,
                    TipoRelacion = relacion.Fallecido1Id == fallecidoId ? relacion.TipoRelacion1 : relacion.TipoRelacion2,
                    FallecidoRelacionado = fallecidoRelacionado != null
                        ? new
                        {
                            fallecidoRelacionado.Id,
                            fallecidoRelacionado.Nombre,
                            fallecidoRelacionado.Genero,
                            fallecidoRelacionado.FechaFallecimiento,
                            ImageUrl = imagePath != null
                                ? $"{baseUrl}/uploads/fallecidos/{fallecidoRelacionado.Id}/image/{Path.GetFileName(imagePath)}"
                                : null,
                        }
                        : null
                });
            }

            return resultado;
        }


        public async Task<bool> DeleteRelacionAsync(string relacionId)
        {
            var result = await _relacionCollection.DeleteOneAsync(r => r.Id == relacionId);
            return result.DeletedCount > 0;
        }


        public async Task<Relacion> GetRelacionByIdAsync(string relacionId)
        {
            return await _relacionCollection.Find(r => r.Id == relacionId).FirstOrDefaultAsync();
        }

    }
}
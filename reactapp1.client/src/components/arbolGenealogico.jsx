import React, { useState, useEffect } from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

const ArbolGenealogico = ({ fallecido, canEdit }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedRelationship, setSelectedRelationship] = useState('');
    const [selectedFallecido, setSelectedFallecido] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    useEffect(() => {
        const createCircularNodes = (data, centerX, centerY, radius, maxNodesPerLayer) => {
            return data.map((item, index) => {
                const layerIndex = Math.floor(index / maxNodesPerLayer);
                const positionInLayer = index % maxNodesPerLayer;

                const currentRadius = radius + (layerIndex * radius * 0.5);

                const totalNodesInLayer = Math.min(data.length - (layerIndex * maxNodesPerLayer), maxNodesPerLayer);
                const angle = (2 * Math.PI * positionInLayer) / totalNodesInLayer;
                const adjustedAngle = layerIndex > 0
                    ? angle + (Math.PI / totalNodesInLayer)
                    : angle;

                return {
                    x: centerX + currentRadius * Math.cos(adjustedAngle),
                    y: centerY + currentRadius * Math.sin(adjustedAngle),
                    layerIndex,
                    item
                };
            });
        };

        const fetchNodes = async () => {
            try {
                const response = await fetch(`/api/fallecidos/getrelacion/${fallecido.Id}`);
                const data = await response.json();

                if (data.length === 0) {
                    console.log('No se encontraron relaciones para este fallecido');
                    return;
                }

                const MAX_NODES_PER_LAYER = 8;
                const CENTER_X = 500;
                const CENTER_Y = 300;
                const INITIAL_RADIUS = 300;

                // Crear el nodo central del fallecido
                const mainNode = {
                    id: fallecido.Id.toString(),
                    position: { x: CENTER_X, y: CENTER_Y },
                    data: {
                        label: (
                            <div className="text-center">
                                <img
                                    src={fallecido.ImageUrl}
                                    alt="Foto"
                                    className="img-fluid rounded-circle mb-2"
                                    style={{
                                        width: '120px',
                                        height: '120px',
                                        objectFit: 'cover'
                                    }}
                                />
                                <h5 className="font-weight-bold">{fallecido.Nombre || 'Desconocido'}</h5>  <span className="material-symbols-outlined rounded-circle me-2" style={{ width: '40px', height: '40px', objectFit: 'cover' }}>face</span>
                                <p>{fallecido.FechaFallecimiento ? fallecido.FechaFallecimiento.split('T')[0] : 'Fecha no disponible'}</p>
                            </div>
                        ),
                    },
                    style: {
                        background: '#fff',
                        border: '2px solid #007bff',
                        borderRadius: '10px',
                        padding: '15px',
                        width: 200,
                        zIndex: 1000 // Asegurarse de que el nodo central esté en primer plano
                    },
                };

                // Generar nodos posicionados circularmente
                const positionedNodes = createCircularNodes(
                    data,
                    CENTER_X,
                    CENTER_Y,
                    INITIAL_RADIUS,
                    MAX_NODES_PER_LAYER
                );

                const loadedNodes = positionedNodes.map(nodeData => {
                    const otherFallecido = nodeData.item.FallecidoRelacionado;

                    return {
                        id: otherFallecido.Id.toString(),
                        position: {
                            x: nodeData.x,
                            y: nodeData.y
                        },
                        data: {
                            label: (
                                <div className="text-center">
                                    <img
                                        src={otherFallecido.ImageUrl}
                                        alt="Foto"
                                        className="img-fluid rounded-circle mb-2"
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            objectFit: 'cover',
                                            opacity: nodeData.layerIndex > 0 ? 0.7 : 1
                                        }}
                                    />
                                    <h6>{otherFallecido.Nombre || 'Desconocido'}</h6>
                                    <p>{otherFallecido.FechaFallecimiento
                                        ? otherFallecido.FechaFallecimiento.split('T')[0] : 'Fecha no disponible'}</p>
                                </div>
                            ),
                        },
                        style: {
                            background: nodeData.layerIndex > 0 ? '#f9f9f9' : '#fff',
                            border: `1px solid ${nodeData.layerIndex > 0 ? '#e0e0e0' : '#dee2e6'}`,
                            borderRadius: '8px',
                            padding: '10px',
                            width: 180,
                            opacity: nodeData.layerIndex > 0 ? 0.8 : 1,
                            zIndex: nodeData.layerIndex || 0 // Corregir el problema de zIndex
                        },
                    };
                });

                // Combinar el nodo principal con los nodos relacionados
                const combinedNodes = [mainNode, ...loadedNodes];

                const loadedEdges = positionedNodes.map(nodeData => {
                    const otherFallecido = nodeData.item.FallecidoRelacionado;
                    return {
                        id: `e${fallecido.Id}-${otherFallecido.Id}`,
                        source: fallecido.Id.toString(),
                        target: otherFallecido.Id.toString(),
                        label: nodeData.item.TipoRelacion,
                        type: 'straight',
                        style: {
                            stroke: nodeData.layerIndex > 0 ? '#999' : '#666',
                            opacity: nodeData.layerIndex > 0 ? 0.5 : 1
                        },
                    };
                });

                // Establecer nodos y bordes
                setNodes(combinedNodes);
                setEdges(loadedEdges);

            } catch (error) {
                console.error('Error al cargar relaciones:', error);
            }
        };

        fetchNodes();
    }, [fallecido.Id]);

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length > 1) {
            try {
                const response = await fetch(`/api/fallecidos/search/${query}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();

                    // Filter out the current fallecido and already added relationships
                    const filteredResults = data.Resultados.filter(result =>
                        result.Id !== fallecido.Id && // Exclude current fallecido
                        !nodes.some(node => node.id === result.Id.toString()) // Exclude already added nodes
                    );

                    setSearchResults(filteredResults);
                } else {
                    const errorText = await response.text();
                    console.error('Error al obtener el fallecido:', errorText);
                }
            } catch (error) {
                console.error('Error al buscar fallecido:', error);
            }
        } else {
            setSearchResults([]);
        }
    };


    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e.target.value);
        }
    };

    const handleSelectFallecido = (result) => {

        setSelectedFallecido(result);
        setSearchQuery(result.Nombre); // Actualiza el input con el nombre seleccionado
        setSearchResults([]); // Limpia los resultados de búsqueda
    };

    const handleAddOrUpdateRelation = async () => {
        if (!selectedFallecido || !selectedRelationship) return;

        const isFallecido1 = isEditing ? selectedFallecido.id === fallecido.Id : true;

        const fetchUrl = isEditing
            ? `/api/fallecidos/updaterelacion/${fallecido.Id}`
            : `/api/fallecidos/addrelacion/${fallecido.Id}`;
        const method = isEditing ? 'PUT' : 'POST';
        const bodyContent = JSON.stringify({
            fallecido1Id: fallecido.Id,
            fallecido2Id: selectedFallecido.Id,
            tipoRelacion1: isFallecido1 ? relationMap[selectedRelationship] : selectedRelationship,
            tipoRelacion2: isFallecido1 ? selectedRelationship : relationMap[selectedRelationship],
        });

        try {
            const response = await fetch(fetchUrl, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: bodyContent,
            });
            const data = await response.json();

            if (isEditing) {
                setEdges((prevEdges) =>
                    prevEdges.map((edge) =>
                        edge.id === `e${fallecido.Id}-${selectedFallecido.id}`
                            ? { ...edge, label: selectedRelationship }
                            : edge
                    )
                );
            } else {
                setNodes((prevNodes) => [
                    ...prevNodes,
                    {
                        id: data.fallecido2Id,
                        position: { x: Math.random() * 500, y: Math.random() * 500 },
                        data: {
                            label: (
                                <div className="text-center">
                                    <img src={selectedFallecido.ImageUrl} className="img-fluid rounded-circle mb-2" />
                                    <h6>{selectedFallecido.Nombre}</h6>
                                    <p>{selectedFallecido.FechaFallecimiento}</p>
                                </div>
                            ),
                        },
                    },
                ]);
                setEdges((prevEdges) => [
                    ...prevEdges,
                    { id: `e${fallecido.Id}-${data.fallecido2Id}`, source: fallecido.Id, target: data.fallecido2Id, label: selectedRelationship },
                ]);
            }
            setIsEditing(false);
        } catch (error) {
            console.error('Error al agregar/actualizar relación:', error);
        }
    };

    const handleDeleteRelation = async () => {
        try {
            await fetch(`/api/fallecidos/deleterelacion/${fallecido.Id}/${selectedFallecido.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setNodes((prevNodes) => prevNodes.filter((node) => node.id !== selectedFallecido.id));
            setEdges((prevEdges) => prevEdges.filter((edge) => edge.target !== selectedFallecido.id));
            setIsEditing(false);
        } catch (error) {
            console.error('Error al eliminar relación:', error);
        }
    };

    const handleNodeClick = (node) => {
        setShowModal(true); 
        // Encuentra el nodo completo en el array de nodos
        const clickedNode = nodes.find((n) => n.id === node.id);

        // Extrae el nombre del label del nodo
        const nombreFromLabel = clickedNode?.data?.label?.props?.children[1]?.props?.children || '';
        const fechaFromLabel = clickedNode?.data?.label?.props?.children[2]?.props?.children || '';

        // Crea un objeto similar al resultado de búsqueda
        const selectedNode = {
            Id: node.id,
            Nombre: nombreFromLabel,
            FechaFallecimiento: fechaFromLabel,
            ImageUrl: clickedNode?.data?.label?.props?.children[0]?.props?.src
        };

        setIsEditing(node.id !== fallecido.Id.toString());
        setSelectedFallecido(selectedNode);
        setSelectedRelationship(edges.find((edge) => edge.target === node.id)?.label || '');
    };

    const handleClose = () => {
        setShowModal(false);
        setSelectedFallecido(null);
        setSelectedRelationship('');
    }

    const relationMap = {
        'Padre/Madre': 'Hijo/a',
        'Hijo/a': 'Padre/Madre',
        'Hermano/a': 'Hermano/a',
        'Tío/a': 'Sobrino/a',
        'Sobrino/a': 'Tío/a',
        'Abuelo/a': 'Nieto/a',
        'Nieto/a': 'Abuelo/a',
        'Primo/a': 'Primo/a',
        'Familiar lejano': 'Familiar lejano',
    };

    return (
        <div className="d-flex" style={{ width: '100%', height: '500px', position: 'relative' }}>
            <div className="w-100" style={{ height: '100%' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodeClick={(event, node) => handleNodeClick(node)}
                    fitView
                    fitViewOptions={{ padding: 0.3 }}
                >
                    <MiniMap />
                    <Controls />
                    <Background />
                </ReactFlow>

                {/* Modal que reemplaza la columna lateral */}
                {(showModal && (selectedFallecido || isEditing)) && (
                    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {canEdit
                                            ? (isEditing ? 'Editar Relación' : 'Agregar Relación')
                                            : (isEditing ? 'Ver Relación' : 'Ver Ser Querido')
                                        }
                                    </h5>
                                    <button type="button" className="btn-close" onClick={handleClose}></button>
                                </div>
                                <div className="modal-body">
                                    {canEdit && (
                                        <div className="mb-3 position-relative">
                                            <label htmlFor="search" className="form-label">Buscar ser querido</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="search"
                                                placeholder="Buscar..."
                                                defaultValue={searchQuery}
                                                onKeyDown={handleKeyDown}
                                            />
                                            {searchResults.length > 0 ? (
                                                <div className="position-absolute w-100 bg-white border rounded shadow-sm"
                                                    style={{
                                                        maxHeight: '200px',
                                                        overflowY: 'auto',
                                                        zIndex: 1000
                                                    }}>
                                                    {searchResults.map((result) => (
                                                        <div
                                                            key={result.id}
                                                            className="p-2 border-bottom cursor-pointer hover:bg-gray-100"
                                                            onClick={() => handleSelectFallecido(result)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <span className="material-symbols-outlined rounded-circle me-2" style={{ width: '40px', height: '40px', objectFit: 'cover' }}>face</span>
                                                                <div>
                                                                    <div className="fw-bold">{result.Nombre}</div>
                                                                    <small className="text-muted">{result.FechaFallecimiento}</small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (searchQuery.length > 1 && (
                                                <div className="position-absolute w-100 bg-white border rounded shadow-sm p-3 text-center text-muted">
                                                    No hay Seres Queridos encontrados
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {selectedFallecido && (
                                        <div className="mb-3 p-2 border rounded">
                                            <h6>Ser Querido:</h6>
                                            <div className="d-flex align-items-center">
                                                <span className="material-symbols-outlined rounded-circle me-2" style={{ width: '30px', height: '30px', objectFit: 'cover' }}>face</span>
                                                <div>
                                                    <div className="fw-bold">{selectedFallecido.Nombre}</div>
                                                    <small className="text-muted">{selectedFallecido.FechaFallecimiento}</small>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {isEditing && (
                                        <div className="mb-3">
                                            <label htmlFor="relationship" className="form-label">Relación</label>
                                            {canEdit ? (
                                                <select
                                                    className="form-select"
                                                    id="relationship"
                                                    value={selectedRelationship}
                                                    onChange={(e) => setSelectedRelationship(e.target.value)}
                                                >
                                                    <option value="">Selecciona una relación</option>
                                                    {Object.keys(relationMap).map((relation) => (
                                                        <option key={relation} value={relation}>
                                                            {relation}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <button
                                                    className="form-select"
                                                    type="button"
                                                    id="relationship"
                                                    disabled
                                                >
                                                    {selectedRelationship}
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {canEdit && (
                                        <div className="modal-footer">
                                            <button
                                                className="btn btn-primary me-2"
                                                onClick={handleAddOrUpdateRelation}
                                                disabled={!selectedFallecido || !selectedRelationship}
                                            >
                                                {isEditing ? 'Guardar' : 'Agregar'}
                                            </button>
                                            {isEditing && (
                                                <button className="btn btn-danger" onClick={handleDeleteRelation}>
                                                    Borrar
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArbolGenealogico;
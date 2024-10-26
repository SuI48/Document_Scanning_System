using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        builder =>
        {
            builder.WithOrigins("http://localhost:4200")  
                   .AllowAnyMethod()                      
                   .AllowAnyHeader();                     
        });
});

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); 
}

app.UseHttpsRedirection(); 

app.UseRouting();

app.UseCors("AllowFrontend"); 

app.UseAuthorization(); 

app.MapControllers(); 

app.Run("http://localhost:5000"); 

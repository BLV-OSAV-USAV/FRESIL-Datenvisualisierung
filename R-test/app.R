library(shiny)
library(shinydashboard)
library(DT)
library(dplyr)


steckbrief = read.csv('/home/2220463/ADURA/csv-files/ad_steckbrief-20231128.csv', sep='|')
meldung = read.csv('/home/2220463/ADURA/csv-files/ad_meldung-20231128.csv', sep='|')
gefahr = read.csv('/home/2220463/ADURA/csv-files/ad_gefahr-20231128.csv', sep='|')

steckbriefXmeldung = read.csv('/home/2220463/ADURA/csv-files/ad_meldung_ad_steckbrief-20231128.csv', sep='|')
steckbriefXgefahr = read.csv('/home/2220463/ADURA/csv-files/ad_steckbrief_ad_gefahr-20231128.csv', sep='|')
meldungXgefahr = read.csv('/home/2220463/ADURA/csv-files/ad_meldung_ad_gefahr-20231128.csv', sep='|')

gefahr_counts <- meldungXgefahr %>%
  group_by(gefahr_id) %>%
  summarize(count = n()) %>%
  rename(id = gefahr_id) %>%
  left_join(gefahr[, c('id', 'bezeichnung_de')], by = 'id')


initial_categories <- 20

ui <- fluidPage(
  titlePanel("ADURA"),
  fluidRow(
    plotlyOutput("treemap"),
  ),
  fluidRow(
    DTOutput("collapse"),
    uiOutput("details-div")
  )
)

server <- function(input, output, session) {
  gefahr_counts <- data.frame(table(data_gefahr$gefahr_id))
  colnames(gefahr_counts) <- c('id', 'count')
  gefahr_counts <- merge(gefahr_counts, gefahr_counts[, c('id', 'bezeichnung_de')], by = 'id', all.x = TRUE)
  
  output$treemap <- renderPlotly({
    treemap <- plot_ly(gefahr_counts[1:initial_categories, ], labels = ~bezeichnung_de, values = ~count, type = 'treemap')
    treemap %>% layout(title = sprintf("Top %d Gefahr Proportions", initial_categories))
  })
  
  output$collapse <- renderDT({
    datatable(
      gefahr_counts,
      options = list(lengthMenu = c(5, 10, 15), pageLength = 5)
    )
  })
  
  output$details_div <- renderUI({
    if (!is.null(input$collapse_rows_selected)) {
      gefahr_id <- gefahr_counts$id[input$collapse_rows_selected]
      details <- data_meldung$meldung_text[data_meldung$gefahr_id == gefahr_id]
      if (length(details) > 0) {
        tagList(
          h4(paste("Details for Gefahr", gefahr_id, ":")),
          ul(lapply(details, function(detail) {
            tags$li(detail)
          }))
        )
      } else {
        h4(paste("No details available for Gefahr", gefahr_id, "."))
      }
    }
  })
  
}

shinyApp(ui, server)
